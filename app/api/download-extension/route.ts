import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import archiver from 'archiver';
import { Readable } from 'stream';

export async function GET(request: NextRequest) {
  try {
    // Create a zip archive
    const archive = archiver('zip', {
      zlib: { level: 9 } // Maximum compression
    });

    // Create a readable stream from the archive
    const stream = new ReadableStream({
      start(controller) {
        archive.on('data', (chunk) => {
          controller.enqueue(chunk);
        });

        archive.on('end', () => {
          controller.close();
        });

        archive.on('error', (err) => {
          controller.error(err);
        });

        // Add Chrome extension files to the archive
        addExtensionFiles(archive);
      }
    });

    return new NextResponse(stream, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': 'attachment; filename="screen-recorder-chrome-extension.zip"',
      },
    });
  } catch (error) {
    console.error('Error creating extension zip:', error);
    return NextResponse.json(
      { error: 'Failed to create extension package' },
      { status: 500 }
    );
  }
}

async function addExtensionFiles(archive: archiver.Archiver) {
  const extensionPath = path.join(process.cwd(), 'chrome-extension');
  
  try {
    // Add all files from the chrome-extension directory
    const files = [
      'manifest.json',
      'popup.html',
      'popup.css',
      'popup.js',
      'background.js',
      'content.js',
      'content.css',
      'settings.html',
      'README.md',
      'INSTALLATION.md'
    ];

    for (const file of files) {
      try {
        const filePath = path.join(extensionPath, file);
        const content = await fs.readFile(filePath, 'utf8');
        archive.append(content, { name: file });
      } catch (fileError) {
        console.warn(`Could not add file ${file}:`, fileError);
        // Continue with other files
      }
    }

    // Add icons directory if it exists
    try {
      const iconsPath = path.join(extensionPath, 'icons');
      const iconFiles = await fs.readdir(iconsPath);
      
      for (const iconFile of iconFiles) {
        try {
          const iconPath = path.join(iconsPath, iconFile);
          const iconContent = await fs.readFile(iconPath);
          archive.append(iconContent, { name: `icons/${iconFile}` });
        } catch (iconError) {
          console.warn(`Could not add icon ${iconFile}:`, iconError);
        }
      }
    } catch (iconsError) {
      console.warn('Icons directory not found:', iconsError);
    }

    // Finalize the archive
    archive.finalize();
  } catch (error) {
    console.error('Error adding extension files:', error);
    // Add fallback content
    archive.append(JSON.stringify({
      manifest_version: 3,
      name: "Screen Recorder & Capture",
      version: "1.0.0",
      description: "Professional screen recording and capture tool"
    }, null, 2), { name: 'manifest.json' });
    
    archive.append(`# Screen Recorder & Capture Extension

This is a professional screen recording and capture Chrome extension.

## Installation
1. Extract this zip file
2. Open Chrome and go to chrome://extensions/
3. Enable Developer mode
4. Click "Load unpacked" and select the extracted folder

## Features
- High-quality screen recording
- Screenshot capture with area selection
- Audio recording support
- Keyboard shortcuts
- Privacy-focused (no data collection)

For detailed installation instructions, visit our website.
`, { name: 'README.md' });

    archive.finalize();
  }
}
