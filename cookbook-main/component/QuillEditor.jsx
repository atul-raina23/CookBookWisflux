import React, { useEffect, useRef } from "react";

const QuillEditor = ({ value, onChange, placeholder = "Start writing..." }) => {
  const editorRef = useRef(null);
  const quillRef = useRef(null);
  const cssLoaded = useRef(false);

  useEffect(() => {
    const initQuill = async () => {
      if (typeof window !== "undefined" && editorRef.current && !quillRef.current) {
        // Load CSS only once
        if (!cssLoaded.current) {
          const link = document.createElement("link");
          link.rel = "stylesheet";
          link.href = "https://cdn.quilljs.com/1.3.6/quill.snow.css";
          document.head.appendChild(link);
          cssLoaded.current = true;
        }

        await new Promise(resolve => setTimeout(resolve, 100));

        const Quill = (await import("quill")).default;

        if (!quillRef.current) {
          quillRef.current = new Quill(editorRef.current, {
            theme: "snow",
            placeholder: placeholder,
            modules: {
              toolbar: [
                [{ header: [1, 2, 3, false] }],
                ["bold", "italic", "underline", "strike"],
                [{ color: [] }, { background: [] }],
                [{ list: "ordered" }, { list: "bullet" }],
                [{ align: [] }],
                ["link", "image"],
                ["clean"],
              ],
            },
          });

          // Force black text color in editor
          const editor = editorRef.current.querySelector('.ql-editor');
          if (editor) {
            editor.style.color = '#000000';
          }

          if (value) {
            quillRef.current.root.innerHTML = value;
          }

          quillRef.current.on("text-change", () => {
            const html = quillRef.current.root.innerHTML;
            onChange?.(html);
          });
        }
      }
    };

    initQuill();

    return () => {
      if (quillRef.current) {
        quillRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (quillRef.current && value !== quillRef.current.root.innerHTML) {
      quillRef.current.root.innerHTML = value || "";
    }
  }, [value]);

  return (
    <div style={{ width: "100%" }}>
      <div ref={editorRef} style={{ minHeight: "200px", color: '#000000' }} />
    </div>
  );
};

export default QuillEditor;