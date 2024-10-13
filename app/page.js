"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { preview } from "@/public/assets";
import { Loader, FormField } from "@/components";
import { downloadImage } from "@/utils";

const Create = () => {
  const [prompt, setPrompt] = useState("");
  const [file, setFile] = useState(null);
  const [uploadedUrl, setUploadedUrl] = useState("");
  const [loading, setLoading] = useState({ generating: false, uploading: false });

  const inputFileRef = useRef(null);

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "prompt") setPrompt(value);
    if (files && files.length > 0) setFile(files[0]);
  };

  const fetchRandomPrompt = async () => {
    try {
      const res = await fetch("https://imagen-backend.onrender.com/random-prompt");
      if (!res.ok) throw new Error("Failed to fetch prompt");
      const { prompt } = await res.json();
      setPrompt(prompt);
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  };

  const generateImage = async () => {
    if (!prompt) return alert("Please provide a prompt");

    try {
      setLoading((prev) => ({ ...prev, generating: true }));
      const res = await fetch("https://imagen-backend.onrender.com/api/v1/dalle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      if (!res.ok) throw new Error("Image generation failed");
      const { file } = await res.json();
      setFile(file);
    } catch (error) {
      alert(`Error: ${error.message}`);
    } finally {
      setLoading((prev) => ({ ...prev, generating: false }));
    }
  };

  const uploadFile = async () => {
    if (!file) return alert("No image to upload");

    try {
      setLoading((prev) => ({ ...prev, uploading: true }));
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/files", { method: "POST", body: formData });
      if (!res.ok) throw new Error("Upload failed");

      const { signedUrl } = await res.json();
      setUploadedUrl(signedUrl);
    } catch (error) {
      console.error("Upload Error:", error);
      alert(`Error: ${error.message}`);
    } finally {
      setLoading((prev) => ({ ...prev, uploading: false }));
    }
  };

  return (
    <section className="max-w-7xl mx-auto">
      <header>
        <h1 className="font-extrabold text-[#222328] text-[32px]">Create</h1>
        <p className="mt-2 text-[#666e75] text-[14px] max-w-[500px]">
          Generate an imaginative image through DALL-E AI
        </p>
      </header>

      <div className="mt-16 max-w-3xl flex flex-col gap-5">
        <FormField
          labelName="Prompt"
          type="text"
          name="prompt"
          placeholder="An Impressionist oil painting of sunflowers in a purple vase…"
          value={prompt}
          handleChange={handleInputChange}
          isSurpriseMe
          handleSurpriseMe={fetchRandomPrompt}
        />

        <div className="relative bg-gray-50 border border-gray-300 rounded-lg w-64 h-64 p-3 flex justify-center items-center">
          {loading.generating ? (
            <Loader />
          ) : file ? (
            <Image src={file} alt={prompt} layout="fill" objectFit="contain" />
          ) : (
            <Image
              width={192}
              height={192}
              src={preview}
              alt="Preview"
              className="object-contain opacity-40"
            />
          )}
        </div>

        <div className="mt-5 flex gap-5">
          <button
            onClick={generateImage}
            className="text-white bg-green-700 rounded-md p-2"
          >
            {loading.generating ? "Generating..." : "Generate"}
          </button>

          <button
            onClick={() => downloadImage(file)}
            className="bg-transparent border-none text-black"
          >
            Download
          </button>
        </div>

        <input type="file" ref={inputFileRef} onChange={handleInputChange} />

        <div className="mt-5">
          <button
            onClick={uploadFile}
            disabled={loading.uploading}
            className="text-white bg-[#6469ff] rounded-md px-5 py-2.5"
          >
            {loading.uploading ? "Uploading..." : "Upload Image"}
          </button>

          {uploadedUrl && (
            <a
              href={uploadedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              View Uploaded Image
            </a>
          )}
        </div>
      </div>
    </section>
  );
};

export default Create;
