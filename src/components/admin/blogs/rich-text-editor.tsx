"use client"

import { useEffect, useRef, useState } from "react"
import Quill from "quill"
import "quill/dist/quill.snow.css"

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

const Font = Quill.import("formats/font")
Font.whitelist = ["sans", "serif", "monospace", "roboto", "inter", "poppins"]
Quill.register(Font, true)
const ColorStyle = Quill.import("attributors/style/color")
const BackgroundStyle = Quill.import("attributors/style/background")
Quill.register(ColorStyle, true)
Quill.register(BackgroundStyle, true)

export default function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const wrapperRef = useRef<HTMLDivElement | null>(null)
  const editorRef = useRef<HTMLDivElement | null>(null)
  const quillRef = useRef<Quill | null>(null)
  const isSyncingFromPropsRef = useRef(false)
  const selectedImageRef = useRef<HTMLImageElement | null>(null)
  const [imageToolbar, setImageToolbar] = useState<{ visible: boolean; x: number; y: number }>({
    visible: false,
    x: 0,
    y: 0,
  })

  const positionImageToolbar = (image: HTMLImageElement | null) => {
    const wrapper = wrapperRef.current
    if (!wrapper || !image) {
      setImageToolbar({ visible: false, x: 0, y: 0 })
      return
    }

    const wrapperRect = wrapper.getBoundingClientRect()
    const imageRect = image.getBoundingClientRect()
    const y = imageRect.top - wrapperRect.top - 44
    const x = imageRect.left - wrapperRect.left

    setImageToolbar({
      visible: true,
      x: Math.max(8, x),
      y: Math.max(8, y),
    })
  }

  const setSelectedImage = (image: HTMLImageElement | null) => {
    const quill = quillRef.current
    if (!quill) return

    quill.root.querySelectorAll("img.ql-selected-image").forEach((img) => img.classList.remove("ql-selected-image"))
    if (image) {
      image.classList.add("ql-selected-image")
    }
    selectedImageRef.current = image
    positionImageToolbar(image)
  }

  useEffect(() => {
    if (!editorRef.current || quillRef.current) return

    const quill = new Quill(editorRef.current, {
      theme: "snow",
      placeholder,
      modules: {
        toolbar: {
          container: [
            [{ font: Font.whitelist }],
            [{ header: [1, 2, 3, false] }],
            [{ size: ["small", false, "large", "huge"] }],
            [{ color: ["#ea580c", "#111827", "#374151", "#6b7280", false] }],
            [{ background: ["#fed7aa", "#fde68a", false] }],
            ["bold", "italic", "underline", "strike"],
            [{ list: "ordered" }, { list: "bullet" }],
            ["blockquote", "link", "image"],
            ["clean"],
          ],
          handlers: {
            image: () => {
              const input = document.createElement("input")
              input.setAttribute("type", "file")
              input.setAttribute("accept", "image/*")
              input.click()

              input.onchange = () => {
                const file = input.files?.[0]
                if (!file) return

                const reader = new FileReader()
                reader.onload = () => {
                  const range = quill.getSelection(true)
                  const insertIndex = range?.index ?? quill.getLength()
                  quill.insertEmbed(insertIndex, "image", reader.result)
                  quill.setSelection(insertIndex + 1)
                }
                reader.readAsDataURL(file)
              }
            },
          },
        },
      },
    })

    if (value) {
      quill.clipboard.dangerouslyPasteHTML(value)
    }

    quill.on("text-change", () => {
      if (isSyncingFromPropsRef.current) return
      onChange(quill.root.innerHTML)
    })

    quill.root.addEventListener("click", (event) => {
      const target = event.target as HTMLElement | null
      if (target && target.tagName === "IMG") {
        setSelectedImage(target as HTMLImageElement)
      } else {
        setSelectedImage(null)
      }
    })

    quill.root.addEventListener("dblclick", (event) => {
      const target = event.target as HTMLElement | null
      if (!target || target.tagName !== "IMG") return

      const image = target as HTMLImageElement
      setSelectedImage(image)

      const input = window.prompt("Set image width (example: 40%, 320px, 100%)", image.style.width || "100%")
      if (!input) return

      image.style.width = input.trim()
      image.style.height = "auto"
      image.style.maxWidth = "100%"
      onChange(quill.root.innerHTML)
      positionImageToolbar(image)
    })

    quillRef.current = quill
  }, [onChange, placeholder, value])

  useEffect(() => {
    const quill = quillRef.current
    if (!quill) return

    const current = quill.root.innerHTML
    const next = value || ""
    if (current === next) return

    isSyncingFromPropsRef.current = true
    quill.clipboard.dangerouslyPasteHTML(next)
    isSyncingFromPropsRef.current = false
  }, [value])

  const applyImageWidth = (width: string) => {
    const quill = quillRef.current
    const selectedImage = selectedImageRef.current
    if (!quill || !selectedImage) return

    selectedImage.style.width = width
    selectedImage.style.height = "auto"
    selectedImage.style.maxWidth = "100%"
    onChange(quill.root.innerHTML)
    positionImageToolbar(selectedImage)
  }

  const applyCustomImageWidth = () => {
    const selectedImage = selectedImageRef.current
    if (!selectedImage) return

    const input = window.prompt("Set image width (example: 40%, 320px, 100%)", selectedImage.style.width || "100%")
    if (!input) return
    applyImageWidth(input.trim())
  }

  return (
    <div ref={wrapperRef} className="bg-white rounded border overflow-hidden relative">
      {imageToolbar.visible && (
        <div
          className="absolute z-20 flex items-center gap-1 rounded-md border border-gray-300 bg-white shadow-lg px-2 py-1"
          style={{ left: imageToolbar.x, top: imageToolbar.y }}
        >
          <button
            type="button"
            className="text-xs border border-gray-300 rounded px-2 py-1 bg-white text-gray-900 hover:bg-gray-100"
            onClick={() => applyImageWidth("30%")}
          >
            S
          </button>
          <button
            type="button"
            className="text-xs border border-gray-300 rounded px-2 py-1 bg-white text-gray-900 hover:bg-gray-100"
            onClick={() => applyImageWidth("50%")}
          >
            M
          </button>
          <button
            type="button"
            className="text-xs border border-gray-300 rounded px-2 py-1 bg-white text-gray-900 hover:bg-gray-100"
            onClick={() => applyImageWidth("75%")}
          >
            L
          </button>
          <button
            type="button"
            className="text-xs border border-gray-300 rounded px-2 py-1 bg-white text-gray-900 hover:bg-gray-100"
            onClick={() => applyImageWidth("100%")}
          >
            Full
          </button>
          <button
            type="button"
            className="text-xs border border-gray-300 rounded px-2 py-1 bg-white text-gray-900 hover:bg-gray-100"
            onClick={applyCustomImageWidth}
          >
            Custom
          </button>
        </div>
      )}
      <div ref={editorRef} />
      <style jsx global>{`
        .ql-container.ql-snow {
          border-top: 0;
        }

        .ql-editor {
          min-height: 320px;
          max-height: 520px;
          overflow-y: auto;
        }

        .ql-toolbar.ql-snow {
          position: sticky;
          top: 0;
          z-index: 10;
          background: #ffffff;
          border-bottom: 1px solid #e5e7eb;
        }

        .ql-snow .ql-picker.ql-font .ql-picker-label[data-value="sans"]::before,
        .ql-snow .ql-picker.ql-font .ql-picker-item[data-value="sans"]::before {
          content: "Sans";
          font-family: Arial, Helvetica, sans-serif;
        }
        .ql-snow .ql-picker.ql-font .ql-picker-label[data-value="serif"]::before,
        .ql-snow .ql-picker.ql-font .ql-picker-item[data-value="serif"]::before {
          content: "Serif";
          font-family: Georgia, "Times New Roman", serif;
        }
        .ql-snow .ql-picker.ql-font .ql-picker-label[data-value="monospace"]::before,
        .ql-snow .ql-picker.ql-font .ql-picker-item[data-value="monospace"]::before {
          content: "Monospace";
          font-family: "Courier New", Courier, monospace;
        }
        .ql-snow .ql-picker.ql-font .ql-picker-label[data-value="roboto"]::before,
        .ql-snow .ql-picker.ql-font .ql-picker-item[data-value="roboto"]::before {
          content: "Roboto";
          font-family: Roboto, Arial, sans-serif;
        }
        .ql-snow .ql-picker.ql-font .ql-picker-label[data-value="inter"]::before,
        .ql-snow .ql-picker.ql-font .ql-picker-item[data-value="inter"]::before {
          content: "Inter";
          font-family: Inter, Arial, sans-serif;
        }
        .ql-snow .ql-picker.ql-font .ql-picker-label[data-value="poppins"]::before,
        .ql-snow .ql-picker.ql-font .ql-picker-item[data-value="poppins"]::before {
          content: "Poppins";
          font-family: Poppins, Arial, sans-serif;
        }

        .ql-font-sans {
          font-family: Arial, Helvetica, sans-serif;
        }
        .ql-font-serif {
          font-family: Georgia, "Times New Roman", serif;
        }
        .ql-font-monospace {
          font-family: "Courier New", Courier, monospace;
        }
        .ql-font-roboto {
          font-family: Roboto, Arial, sans-serif;
        }
        .ql-font-inter {
          font-family: Inter, Arial, sans-serif;
        }
        .ql-font-poppins {
          font-family: Poppins, Arial, sans-serif;
        }

        .ql-snow .ql-tooltip {
          background: #ffffff;
          color: #111827;
          border: 1px solid #d1d5db;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
        }

        .ql-snow .ql-tooltip input[type="text"] {
          background: #ffffff !important;
          color: #111827;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          padding: 6px 10px;
        }

        .ql-snow .ql-tooltip a.ql-action,
        .ql-snow .ql-tooltip a.ql-remove {
          color: #2563eb;
        }

        .ql-editor img {
          max-width: 100%;
          height: auto;
        }

        .ql-editor img.ql-selected-image {
          outline: 2px solid #3b82f6;
          outline-offset: 2px;
        }
      `}</style>
    </div>
  )
}
