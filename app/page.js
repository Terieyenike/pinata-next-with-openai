"use client";

import { useState } from "react";
import Image from "next/image";
import { preview } from "@/public/assets";
import { Loader, FormField } from "@/components";

const Create = () => {
  const [form, setForm] = useState({
    prompt: "",
    photo: "",
  });
  const { prompt, photo } = form;

  const [generatingImg, setGeneratingImg] = useState(false);
  const [loading, setLoading] = useState(false);
  const [url, setUrl] = useState("");
  const [uploading, setUploading] = useState(false);

  const handleChange = (e) => {
    if (!e || !e.target) {
      console.error("Event object is not available");
      return;
    }
    const { name, value } = e.target
    setForm({ ...form, [name]: value });
  };

  const handleSurpriseMe = async () => {
    try {
      const response = await fetch(
        "https://imagen-backend.onrender.com/random-prompt"
      );
      if (!response.ok) throw new Error("Failed to fetch prompt");

      const { prompt } = await response.json();
      setForm({ ...form, prompt });
    } catch (error) {
      alert("Error: " + error.message);
    }
  };

  const generateImage = async () => {
    if (prompt) {
      try {
        setGeneratingImg(true);
        setLoading(true); // Set loading state

        const response = await fetch(
          "https://imagen-backend.onrender.com/api/v1/dalle",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ prompt }),
          }
        );

        const data = await response.json();
        setForm({ ...form, photo: data.photo }); // Store the image URL or base64
      } catch (err) {
        alert("Error: " + err.message);
      } finally {
        setGeneratingImg(false);
        setLoading(false); // Reset loading state
      }
    } else {
      alert("Please provide a prompt");
    }
  };

  const uploadFile = async () => {
    try {
      if (!photo) throw new Error("No image generated to upload");

      setUploading(true);
      const data = new FormData();
      data.set("file", photo);
      console.log(data.get('file'), "data set")
      console.log(data.file, 'this is the data')

      const response = await fetch("/api/files", {
        method: "POST",
        body: "https://res.cloudinary.com/terieyenike/image/upload/v1723648082/oteri_eyenike_wvort6.png",
      });

      // Check if the response is OK, otherwise throw an error
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Upload failed");
      }

      const { signedUrl } = await response.json();
      setUrl(signedUrl); // Set the signed URL from response

    } catch (e) {
      console.error("Upload Error:", e);
      alert(`Error: ${e.message}`);
    } finally {
      setUploading(false);
    }
  };


  return (
    <section className="max-w-7xl mx-auto">
      <div>
        <h1 className="font-extrabold text-[#222328] text-[32px]">Create</h1>
        <p className="mt-2 text-[#666e75] text-[14px] max-w-[500px]">
          Generate an imaginative image through DALL-E AI
        </p>
      </div>

      <div className="mt-16 max-w-3xl flex flex-col gap-5">
        <FormField
          labelName="Prompt"
          type="text"
          name="prompt"
          placeholder="An Impressionist oil painting of sunflowers in a purple vase…"
          value={prompt}
          handleChange={handleChange}
          isSurpriseMe
          handleSurpriseMe={handleSurpriseMe}
        />

        <div className="relative bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-64 p-3 h-64 flex justify-center items-center">
          {loading ? (
            <Loader />
          ) : photo ? (
            <Image
              src={photo}
              alt={prompt}
              layout="fill"
              objectFit="contain"
            />
          ) : (
            <Image
              width={192}
              height={192}
              id="file"
              src={preview}
              alt="preview"
              className="object-contain opacity-40"
            />
          )}
        </div>

        <div className="mt-5 flex gap-5">
          <button
            type="button"
            onClick={generateImage}
            className="text-white bg-green-700 rounded-md p-2"
          >
            {generatingImg ? "Generating..." : "Generate"}
          </button>
        </div>

        <div className="mt-5">
          <button
            type="button"
            onClick={uploadFile}
            disabled={uploading}
            className="text-white bg-[#6469ff] font-medium rounded-md text-sm w-full sm:w-auto px-5 py-2.5 text-center"
          >
            {uploading ? "Uploading..." : "Upload Image"}
          </button>
          {url && (
            <a href={url} className="underline" target="_blank" rel="noopener noreferrer">
              View Uploaded Image
            </a>
          )}
        </div>
      </div>
    </section>
  );
};

export default Create;
