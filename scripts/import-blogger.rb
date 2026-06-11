#!/usr/bin/env ruby

require "cgi"
require "fileutils"
require "json"
require "open3"
require "rexml/document"
require "uri"

ROOT = File.expand_path("..", __dir__)
FEED_PATH = File.join(ROOT, "Blogger/Blogs/コヲリドットネット/feed.atom")
ALBUM_PATH = File.join(ROOT, "Blogger/Albums/コヲリドットネット")
CONTENT_PATH = File.join(ROOT, "src/content/blog")
ASSET_PATH = File.join(ROOT, "public/blog-assets/blogger")
ATOM_NS = {
  "atom" => "http://www.w3.org/2005/Atom",
  "blogger" => "http://schemas.google.com/blogger/2018",
}.freeze

def element_text(entry, path)
  REXML::XPath.first(entry, path, ATOM_NS)&.text.to_s
end

def existing_titles
  Dir.glob(File.join(CONTENT_PATH, "*.md")).map do |path|
    match = File.read(path, encoding: "UTF-8").match(/^title:\s*("(?:[^"\\]|\\.)*")\s*$/)
    JSON.parse(match[1]) if match
  end.compact.to_h { |title| [title, true] }
end

def media_dimensions(media)
  media.each_with_object(Hash.new { |hash, key| hash[key] = [] }) do |path, dimensions|
    output, status = Open3.capture2(
      "magick", "identify", "-format", "%w x %h", path,
      err: File::NULL
    )
    dimensions[output.strip] << path if status.success? && !output.strip.empty?
  end
end

def html_attributes(tag)
  tag.scan(/([:\w-]+)\s*=\s*(["'])(.*?)\2/im).to_h do |name, _, value|
    [name.downcase, CGI.unescapeHTML(value)]
  end
end

def public_asset_path(source_path)
  filename = File.basename(source_path)
  escaped = URI::DEFAULT_PARSER.escape(filename)
  "/blog-assets/blogger/#{escaped}"
end

def resolve_image(tag, media, dimensions)
  attributes = html_attributes(tag)
  source = attributes["src"].to_s
  decoded_source = URI.decode_www_form_component(source)

  matched = media.find { |path| decoded_source.include?(File.basename(path)) }
  unless matched
    width = attributes["data-original-width"]
    height = attributes["data-original-height"]
    candidates = dimensions["#{width} x #{height}"]
    matched = candidates.first if width && height && candidates.length == 1
  end

  {
    source: matched ? public_asset_path(matched) : source,
    local_path: matched,
    alt: attributes["alt"].to_s,
  }
end

def render_image(tag, media, dimensions, copied_assets)
  image = resolve_image(tag, media, dimensions)
  if image[:local_path]
    FileUtils.cp(image[:local_path], ASSET_PATH)
    copied_assets[File.basename(image[:local_path])] = true
  end

  alt = CGI.escapeHTML(image[:alt])
  source = CGI.escapeHTML(image[:source])
  %(<img src="#{source}" alt="#{alt}" loading="lazy">)
end

def clean_html(html, media, dimensions, copied_assets)
  body = html.dup

  body.gsub!(/<a\b[^>]*>\s*(<img\b[^>]*>)\s*<\/a>/im) do
    render_image(Regexp.last_match(1), media, dimensions, copied_assets)
  end
  body.gsub!(/<img\b[^>]*>/im) do |tag|
    render_image(tag, media, dimensions, copied_assets)
  end

  body.gsub!(/<h1\b[^>]*>/i, "<h2>")
  body.gsub!(/<\/h1>/i, "</h2>")
  body.gsub!(/<h4\b[^>]*>/i, "<h3>")
  body.gsub!(/<\/h4>/i, "</h3>")
  body.gsub!(/<(h2|h3|p|ol|ul|li|blockquote)\b[^>]*>/i, '<\1>')

  body.gsub!(/<a\b([^>]*)>/im) do
    href = html_attributes(Regexp.last_match(0))["href"]
    href ? %(<a href="#{CGI.escapeHTML(href)}">) : "<a>"
  end

  body.gsub!(/<\/?(?:div|span)\b[^>]*>/im, "")
  body.gsub!(/<b\b[^>]*>/i, "<strong>")
  body.gsub!(/<\/b>/i, "</strong>")
  body.gsub!(/<strike\b[^>]*>/i, "<del>")
  body.gsub!(/<\/strike>/i, "</del>")
  body.gsub!(/<u\b[^>]*>|<\/u>/i, "")
  body.gsub!(/<br\s*\/?>\s*<br\s*\/?>/im, "<br>")
  body.gsub!(/(?:<p>\s*(?:&nbsp;|\s|<br\s*\/?>)*<\/p>\s*)+/im, "")
  body.gsub!(/(?:<br\s*\/?>\s*){3,}/im, "<br><br>")
  body.strip
end

def plain_text(html)
  CGI.unescapeHTML(
    html
      .gsub(/<script\b.*?<\/script>/im, " ")
      .gsub(/<style\b.*?<\/style>/im, " ")
      .gsub(/<[^>]+>/, " ")
  ).gsub(/\s+/, " ").strip
end

def description_for(html)
  text = plain_text(html)
  return "Bloggerから移行した過去記事。" if text.empty?

  text.length > 100 ? "#{text[0, 100]}…" : text
end

def slug_for(entry, published, used_slugs)
  filename = element_text(entry, "blogger:filename")
  basename = File.basename(filename, ".html")
  basename = "post" if basename.empty?
  base_slug = "#{published}-#{basename}".downcase.gsub(/[^a-z0-9_-]+/, "-").gsub(/\A-+|-+\z/, "")
  base_slug = "#{published}-post" if base_slug.empty?
  slug = base_slug
  suffix = 2

  while used_slugs[slug]
    slug = "#{base_slug}-#{suffix}"
    suffix += 1
  end

  used_slugs[slug] = true
  slug
end

FileUtils.mkdir_p(CONTENT_PATH)
FileUtils.mkdir_p(ASSET_PATH)

media = Dir.glob(File.join(ALBUM_PATH, "*")).reject do |path|
  path.end_with?(".json") || !File.file?(path)
end
dimensions = media_dimensions(media)
protected_titles = existing_titles
used_slugs = Dir.glob(File.join(CONTENT_PATH, "*.md")).to_h do |path|
  [File.basename(path, ".md"), true]
end
copied_assets = {}
document = REXML::Document.new(File.read(FEED_PATH, encoding: "UTF-8"))
entries = REXML::XPath.match(document, "/atom:feed/atom:entry", ATOM_NS)
created = []

entries.each do |entry|
  next unless element_text(entry, "blogger:type") == "POST"
  next unless element_text(entry, "blogger:status") == "LIVE"

  published = element_text(entry, "atom:published")[0, 10]
  original_title = element_text(entry, "atom:title").strip
  title = original_title.empty? ? "無題の記事 (#{published})" : original_title
  next if protected_titles[title]

  raw_html = element_text(entry, "atom:content")
  cleaned_html = clean_html(raw_html, media, dimensions, copied_assets)
  tags = REXML::XPath.match(entry, "atom:category", ATOM_NS)
    .map { |category| category.attributes["term"] }
    .compact
  slug = slug_for(entry, published, used_slugs)
  frontmatter = {
    "title" => title,
    "description" => description_for(raw_html),
    "published" => published,
    "tags" => tags,
  }

  markdown = <<~MARKDOWN
    ---
    title: #{frontmatter["title"].to_json}
    description: #{frontmatter["description"].to_json}
    published: #{frontmatter["published"]}
    tags: #{frontmatter["tags"].to_json}
    ---

    #{cleaned_html}
  MARKDOWN

  File.write(File.join(CONTENT_PATH, "#{slug}.md"), markdown, encoding: "UTF-8")
  created << slug
end

puts "Created #{created.length} articles."
puts "Copied #{copied_assets.length} matched assets."
