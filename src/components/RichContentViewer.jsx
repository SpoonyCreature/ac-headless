"use client";
import React from "react";
import { quickStartViewerPlugins, RicosViewer } from "@wix/ricos";
import "@wix/ricos/css/all-plugins-viewer.css";

const plugins = quickStartViewerPlugins();

const RichContentViewer = ({ content }) => {
    return <RicosViewer content={content} plugins={plugins} />;
};

export default RichContentViewer; 