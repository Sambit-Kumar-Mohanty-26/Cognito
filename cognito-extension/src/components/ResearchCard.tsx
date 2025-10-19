// src/components/ResearchCard.tsx
import React, { useState, useEffect, useRef } from 'react';
import type { ResearchCard } from '../types';

interface ResearchCardProps {
  card: ResearchCard;
}

// Function to convert data URL to Blob
function dataURLtoBlob(dataurl: string): Blob {
  const parts = dataurl.split(',');
  const mimeMatch = parts[0].match(/:(.*?);/);
  const mime = mimeMatch ? mimeMatch[1] : 'image/png';
  const base64Part = parts[1];

  const byteCharacters = atob(base64Part);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);

  return new Blob([byteArray], { type: mime });
}

export const ResearchCardComponent: React.FC<ResearchCardProps> = ({ card }) => {
  const [displayBlobUrl, setDisplayBlobUrl] = useState<string | undefined>(undefined);
  const imageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let objectUrl: string | undefined;

    if (card.type === 'image' && typeof card.content === 'string' && card.content.startsWith('data:image')) {
      try {
        const blob = dataURLtoBlob(card.content);
        objectUrl = URL.createObjectURL(blob);
        console.log('DEBUG: ResearchCard - Generated object URL:', objectUrl);
        setDisplayBlobUrl(objectUrl);
      } catch (error) {
        console.error("Error creating object URL from data:image:", error);
        setDisplayBlobUrl(undefined);
      }
    } else {
      setDisplayBlobUrl(undefined);
    }

    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [card.content, card.type]); // Rerun when card content or type changes

  useEffect(() => {
    if (displayBlobUrl && imageRef.current) {
      const imgElement = new Image();
      imgElement.src = displayBlobUrl;
      imgElement.alt = card.summary;
      imgElement.style.width = '100px';
      imgElement.style.height = '100px';
      imgElement.style.display = 'block';
      imgElement.style.opacity = '1';
      imgElement.style.backgroundColor = 'yellow';
      imgElement.style.border = '2px solid blue';
      imgElement.style.objectFit = 'contain';
      imgElement.className = 'rounded-md'; // Apply TailwindCSS class

      // Clear previous content and append new image
      while (imageRef.current.firstChild) {
        imageRef.current.removeChild(imageRef.current.firstChild);
      }
      imageRef.current.appendChild(imgElement);
    } else if (imageRef.current) {
      // If no image URL, clear the div
      while (imageRef.current.firstChild) {
        imageRef.current.removeChild(imageRef.current.firstChild);
      }
    }
  }, [displayBlobUrl, card.summary]); // Rerun when blob URL or summary changes

  const renderCardContent = () => {
    if (card.type === 'text' && typeof card.content === 'string') {
      return <p className="text-slate-600 mt-2 text-sm">{card.content}</p>;
    } else if (card.type === 'image') {
      return (
        <div className="mt-2 p-1 flex justify-center items-center">
          <div ref={imageRef} style={{ width: '100px', height: '100px', backgroundColor: 'yellow', border: '2px solid blue' }}>
            {/* Image will be dynamically appended here */}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-slate-200 p-4 mb-4">
      <h3 className="text-lg font-semibold text-slate-800">{card.summary}</h3>
      {card.tags && card.tags.length > 0 && (
        <p className="text-sm text-slate-500">Tags: {card.tags.join(', ')}</p>
      )}
      {renderCardContent()}
      {card.provenance && card.provenance.status && (
        <div className="mt-2 p-2 bg-slate-50 rounded-md text-sm">
          <p>Status: {card.provenance.status}</p>
          {card.provenance.findings && (
            <p>Findings: {card.provenance.findings}</p>
          )}
        </div>
      )}
    </div>
  );
};