# Blog Content Storage Architecture (ProseMirror JSON)

This document provides a detailed explanation of the design decisions and operational workflow for the blog content storage system within the SourceHub project.

---

## 1. The Problem with Traditional Methods
Typically, when building a blog feature, content is saved as either **Raw HTML** or **Markdown**. However, both methods have significant drawbacks:
- **HTML**: Highly vulnerable to XSS (Cross-Site Scripting) attacks if not meticulously sanitized. Furthermore, rendering it natively on other platforms (e.g., iOS/Android mobile apps) is difficult without relying on WebViews.
- **Markdown**: More secure but inherently limited in advanced formatting (e.g., text color changes, text alignment, embedded custom video players, or complex UI components).

## 2. The Solution: Abstract Syntax Tree (JSON AST)
To completely resolve these issues, our system adopts the **ProseMirror JSON** architecture. The entire blog post is represented as an Abstract Syntax Tree (AST) and persisted to the PostgreSQL database as a `JSONB` data type.

### Basic JSON Structure
Every post is a JSON object consisting of nested `nodes`. Each `node` represents a specific block or element of the document (e.g., paragraphs, headings, images, text).

Example of a short post containing bold text:
```json
{
  "type": "doc",
  "content": [
    {
      "type": "heading",
      "attrs": { "level": 1, "textAlign": "center" },
      "content": [
        { "type": "text", "text": "Welcome to SourceHub" }
      ]
    },
    {
      "type": "paragraph",
      "content": [
        { "type": "text", "text": "This is " },
        { "type": "text", "text": "bold text", "marks": [{ "type": "bold" }] },
        { "type": "text", "text": "." }
      ]
    }
  ]
}
```

### Key Advantages
1. **Absolute Security**: Because the content is just JSON data, it cannot contain executable `<script>` tags. It is completely immune to XSS injection natively.
2. **Infinite Extensibility**: We can easily define custom nodes (e.g., `productButton`, `warningBox`) without breaking the document structure.
3. **Cross-Platform Compatibility**: JSON can be easily parsed and rendered natively on browsers (using React), iOS (using Swift), or Android (using Kotlin) without any WebViews.
4. **Database Query Performance**: PostgreSQL has native support for `JSONB`. We can perform complex queries, such as fetching all posts that "contain a video node", directly via SQL.

---

## 3. System Workflow

The architecture is divided into three distinct phases: **Writing (Editor)** -> **Storage (Database)** -> **Rendering (Storefront)**.

### Step 1: Writing (Tiptap Editor)
On the Admin Dashboard, we use the **Tiptap** library.
- Tiptap is a headless editor built on top of ProseMirror.
- Every keystroke, image upload, or color change is instantly mapped to a JSON Tree in memory.
- When the administrator clicks "Save", React invokes `editor.getJSON()` to retrieve the JSON payload and sends it to the Backend API.

### Step 2: Storage (.NET Backend & PostgreSQL)
On the backend, the `Post.cs` entity features a specific property:
```csharp
public string ContentJson { get; set; } = "{}";
```
- When this data is passed through Entity Framework Core, it is directly mapped and stored into a column defined as the `jsonb` data type in PostgreSQL.

### Step 3: Optimized Rendering (JsonRenderer)
On the public storefront, **we absolutely DO NOT use the Tiptap Editor library to display the post.** Loading a heavy WYSIWYG editor simply to read text severely impacts page load speed and SEO performance.

Instead, we built a specialized React component: `JsonRenderer.tsx` (located at `src/components/blog/JsonRenderer.tsx`).
- It utilizes a **Recursive Algorithm**.
- It traverses the JSON tree from the root (`doc` node). For every node it encounters, it returns the corresponding native React HTML element.
  - Encounter `type: "heading", attrs: { level: 2 }` => `<h2 className="text-2xl font-bold">...</h2>`
  - Encounter `type: "image"` => `<figure><img src="..." /></figure>`
  - Encounter `marks: [{ type: "bold" }]` => Wraps the text inside `<strong>` tags.
- This process happens instantaneously, is incredibly lightweight, and completely removes the need for bulky third-party parsing libraries.

---

## 4. Custom System Nodes
To cater to the specialized needs of our platform (e.g., sharing resources and tutorials), we extended Tiptap by defining the following custom nodes:

### Video Node (`type: "video"`)
- **Purpose**: Allows direct embedding of native video players inside the blog post.
- **Saved Data Schema**:
  ```json
  {
    "type": "video",
    "attrs": {
      "src": "https://r2.cloudflare.com/video.mp4",
      "controls": true,
      "poster": null,
      "caption": "Tutorial Video"
    }
  }
  ```

### File Attachment Node (`type: "fileAttachment"`)
- **Purpose**: Generates a visually distinct, clickable UI Box that allows readers to download an attached file (e.g., source code ZIPs, PDFs).
- **Saved Data Schema**:
  ```json
  {
    "type": "fileAttachment",
    "attrs": {
      "src": "https://r2.cloudflare.com/document.zip",
      "fileName": "Project-Setup.zip",
      "fileSize": 1048576,
      "mimeType": "application/zip"
    }
  }
  ```

---

## Summary
By leveraging the ProseMirror JSON AST, SourceHub establishes an Enterprise-grade blogging architecture: Highly robust and flexible during editing (akin to Notion or Medium), while guaranteeing maximum performance, SEO, and security on the public frontend.
