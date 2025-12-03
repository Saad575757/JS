import React from 'react';

/**
 * Simple Markdown-like formatter for chat messages
 * Supports: **bold**, lists, paragraphs, headings, emojis
 */
export default function FormattedMessage({ text }) {
  if (!text) return null;

  // Split into lines and process
  const lines = text.split('\n');
  const elements = [];
  let currentParagraph = [];
  let inList = false;
  let listItems = [];

  const processParagraph = (para) => {
    if (!para.trim()) return null;
    
    // Process inline formatting
    let processed = para;
    
    // **bold** → <strong>
    processed = processed.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    
    // Handle emojis and icons
    return <span dangerouslySetInnerHTML={{ __html: processed }} />;
  };

  lines.forEach((line, idx) => {
    const trimmed = line.trim();
    
    // Skip empty lines between content
    if (!trimmed && currentParagraph.length === 0 && listItems.length === 0) {
      return;
    }

    // Heading (starts with #)
    if (trimmed.startsWith('#')) {
      // Flush current content
      if (currentParagraph.length > 0) {
        elements.push(
          <p key={`p-${elements.length}`} className="mb-2">
            {processParagraph(currentParagraph.join(' '))}
          </p>
        );
        currentParagraph = [];
      }
      if (listItems.length > 0) {
        elements.push(
          <ul key={`ul-${elements.length}`} className="mb-3">
            {listItems.map((item, i) => (
              <li key={i}>{processParagraph(item)}</li>
            ))}
          </ul>
        );
        listItems = [];
        inList = false;
      }

      const level = trimmed.match(/^#+/)[0].length;
      const headingText = trimmed.replace(/^#+\s*/, '');
      const HeadingTag = `h${Math.min(level + 3, 6)}`; // h4-h6 for chat
      
      elements.push(
        React.createElement(
          HeadingTag,
          { key: `h-${elements.length}`, className: 'fw-bold mb-2 mt-2' },
          processParagraph(headingText)
        )
      );
      return;
    }

    // List items (• or - or numbers)
    if (/^[•\-\*]\s/.test(trimmed) || /^\d+\.\s/.test(trimmed)) {
      // Flush paragraph
      if (currentParagraph.length > 0) {
        elements.push(
          <p key={`p-${elements.length}`} className="mb-2">
            {processParagraph(currentParagraph.join(' '))}
          </p>
        );
        currentParagraph = [];
      }

      inList = true;
      const itemText = trimmed.replace(/^[•\-\*\d\.]\s*/, '');
      listItems.push(itemText);
      return;
    }

    // Regular content
    if (trimmed) {
      // If we were in a list, close it
      if (inList && listItems.length > 0) {
        elements.push(
          <ul key={`ul-${elements.length}`} className="mb-3">
            {listItems.map((item, i) => (
              <li key={i}>{processParagraph(item)}</li>
            ))}
          </ul>
        );
        listItems = [];
        inList = false;
      }

      currentParagraph.push(trimmed);
    } else {
      // Empty line - end paragraph
      if (currentParagraph.length > 0) {
        elements.push(
          <p key={`p-${elements.length}`} className="mb-2">
            {processParagraph(currentParagraph.join(' '))}
          </p>
        );
        currentParagraph = [];
      }
    }
  });

  // Flush remaining content
  if (currentParagraph.length > 0) {
    elements.push(
      <p key={`p-${elements.length}`} className="mb-2">
        {processParagraph(currentParagraph.join(' '))}
      </p>
    );
  }
  if (listItems.length > 0) {
    elements.push(
      <ul key={`ul-${elements.length}`} className="mb-3">
        {listItems.map((item, i) => (
          <li key={i}>{processParagraph(item)}</li>
        ))}
      </ul>
    );
  }

  return <div className="formatted-message">{elements}</div>;
}

