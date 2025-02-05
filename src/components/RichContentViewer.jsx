"use client";
import React from "react";
import { quickStartViewerPlugins, RicosViewer } from "@wix/ricos";
import "@wix/ricos/css/all-plugins-viewer.css";

const plugins = quickStartViewerPlugins();

const RichContentViewer = ({ content }) => {
    return (
        <div className="[&_p]:text-xl [&_p]:leading-relaxed [&_p]:text-gray-700 [&_p]:mb-6
            [&_h1]:text-4xl [&_h1]:font-serif [&_h1]:mb-6
            [&_h2]:text-3xl [&_h2]:font-serif [&_h2]:mb-4
            [&_h3]:text-2xl [&_h3]:font-serif [&_h3]:mb-4
            [&_ul]:text-xl [&_ul]:text-gray-700 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-6
            [&_ol]:text-xl [&_ol]:text-gray-700 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-6
            [&_li]:mb-2
            [&_blockquote]:text-xl [&_blockquote]:italic [&_blockquote]:border-l-4 [&_blockquote]:border-indigo-900/20 [&_blockquote]:pl-4 [&_blockquote]:py-2 [&_blockquote]:mb-6
            [&_a]:text-gray-900 [&_a]:underline [&_a]:decoration-gray-400 hover:[&_a]:decoration-gray-900">
            <RicosViewer content={content} plugins={plugins} />
        </div>
    );
};

export default RichContentViewer; 