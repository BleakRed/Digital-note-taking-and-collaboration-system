# Markdown Language Reference

> A comprehensive showcase of all Markdown syntax features.

---

## 1. Headings

# Heading 1
## Heading 2
### Heading 3
#### Heading 4
##### Heading 5
###### Heading 6

---

## 2. Text Formatting

**Bold text** using double asterisks or underscores.

*Italic text* using single asterisks or underscores.

***Bold and italic*** combined.

~~Strikethrough~~ using double tildes.

`Inline code` using backticks.

<u>Underlined text</u> using HTML.

---

## 3. Horizontal Rules

Three hyphens:

---

Three underscores:

___

Three asterisks:

***

---

## 4. Blockquotes

> This is a blockquote.
> It can span multiple lines.
> > And support nesting.

> **Tip:** Blockquotes can contain *italic*, **bold**, and `code` too.

---

## 5. Lists

### Unordered

- Item one
- Item two
  - Nested item
  - Another nested
    - Deeply nested
- Item three

* Alternative bullet
* Another one

+ Plus sign bullet
+ Works the same

### Ordered

1. First item
2. Second item
   1. Nested ordered
   2. Another nested
3. Third item

### Task List

- [x] Completed task
- [ ] Incomplete task
- [ ] Another incomplete
- [x] Done!

---

## 6. Code

### Inline Code

Use `console.log('hello')` to print to the console.

### Code Block (Fenced)

```javascript
function greet(name) {
  return `Hello, ${name}!`;
}

const message = greet('World');
console.log(message);
```

```python
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)

for i in range(10):
    print(fibonacci(i))
```

```bash
#!/bin/bash
echo "Hello, World!"
```

### Without Syntax Highlighting

```
    No language specified.
    Indented code block.
```

---

## 7. Tables

| Left Align | Center Align | Right Align | Default |
|:-----------|:------------:|------------:|---------|
| `:` left  | `::` center  | `:` right   | No colon |
| Row 2      |    Row 2     |       Row 2 | Row 2    |
| Row 3      |    Row 3     |       Row 3 | Row 3    |

| Feature       | Supported |
|:--------------|:---------:|
| Headings      |    ✅     |
| Bold/Italic   |    ✅     |
| Code blocks   |    ✅     |
| Tables        |    ✅     |
| Links         |    ✅     |
| Images        |    ✅     |
| Blockquotes   |    ✅     |

---

## 8. Links

### Basic Links

[GitHub](https://github.com)

[OpenAI](https://openai.com "OpenAI Homepage")

### Reference Links

This is a [reference link][ref] that uses a label.

[ref]: https://example.com "Reference label"

### Auto Links

<https://github.com>

<mailto:user@example.com>

---

## 9. Images

### Basic Image

![Alt text](https://via.placeholder.com/150x100.png "Image title")

### Image with Link

[![Alt](https://via.placeholder.com/100x60.png)](https://github.com)

---

## 10. HTML Elements

<details>
<summary>Click to expand (details/summary)</summary>

This content is hidden until clicked.

- Supports **markdown** inside
- `code` works too
- Lists and tables as well

</details>

---

## 11. Escaped Characters

Asterisks: \*not italic\*

Backslashes: \\

Backticks: \`inline code\`

Hashtags: \# not a heading

Links: \[not a link\]

---

## 12. Footnotes

Here is some text with a footnote.[^1]

Another paragraph referring to a footnote.[^note]

[^1]: This is the first footnote. It can contain multiple lines.

[^note]: And this is the second footnote.

---

## 13. Definition Lists

Term 1
: Definition of term 1.

Term 2
: Definition of term 2 with *markdown* support.
: Multiple definitions supported.

---

## 14. Abbreviations

The HTML specification is maintained by the W3C.

*[HTML]: Hyper Text Markup Language
*[W3C]: World Wide Web Consortium

---

## 15. Custom Containers

> [!NOTE]
> Useful for highlighting important information.

> [!TIP]
> Helpful suggestions and tips.

> [!WARNING]
> Things to be careful about.

> [!CAUTION]
> Potential dangers or issues.

> [!IMPORTANT]
> Critical information to remember.

---

*End of Markdown Reference*