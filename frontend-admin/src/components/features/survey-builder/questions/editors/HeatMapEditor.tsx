'use client';

import { useState, useRef, MouseEvent } from 'react';
import { X, MapPin, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSurveyBuilder } from '@/contexts/SurveyBuilderContext';
import { ImageUpload } from '@/components/ui/ImageUpload';
import type { HeatMapQuestion } from '@/api/contracts';

interface HeatMapEditorProps {
  blockId: string;
  question: HeatMapQuestion;
}

export function HeatMapEditor({ blockId, question }: HeatMapEditorProps) {
  const { dispatch } = useSurveyBuilder();
  const imageRef = useRef<HTMLDivElement>(null);
  const [hoveredClick, setHoveredClick] = useState<string | null>(null);

  const updateQuestion = (updates: Partial<HeatMapQuestion>) => {
    dispatch({
      type: 'UPDATE_QUESTION',
      payload: { blockId, question: { ...question, ...updates } },
    });
  };

  const handleImageUpload = (imageUrl: string, width: number, height: number) => {
    updateQuestion({
      imageUrl,
      imageWidth: width,
      imageHeight: height,
    });
  };

  const handleImageClear = () => {
    updateQuestion({
      imageUrl: undefined,
      imageWidth: undefined,
      imageHeight: undefined,
      clicks: [],
    });
  };

  const handleImageClick = (e: MouseEvent<HTMLDivElement>) => {
    if (!imageRef.current || !question.imageUrl) return;

    const rect = imageRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Calculate relative coordinates (0-1 range)
    const relativeX = x / rect.width;
    const relativeY = y / rect.height;

    // Convert to actual image coordinates
    const actualX = Math.round(relativeX * (question.imageWidth || 1));
    const actualY = Math.round(relativeY * (question.imageHeight || 1));

    // Check if clicking on existing marker to remove it
    const clickedExisting = question.clicks.find((click) => {
      const clickRelX = click.x / (question.imageWidth || 1);
      const clickRelY = click.y / (question.imageHeight || 1);
      const displayX = clickRelX * rect.width;
      const displayY = clickRelY * rect.height;
      const distance = Math.sqrt(Math.pow(x - displayX, 2) + Math.pow(y - displayY, 2));
      return distance < 15; // 15px tolerance
    });

    if (clickedExisting) {
      // Remove click
      updateQuestion({
        clicks: question.clicks.filter((c) => c.id !== clickedExisting.id),
      });
      return;
    }

    // Check if max clicks reached
    if (question.clicks.length >= question.maxClicks) {
      // Replace oldest click (FIFO)
      const newClicks = [...question.clicks.slice(1)];
      newClicks.push({
        id: `click-${crypto.randomUUID()}`,
        x: actualX,
        y: actualY,
        regionId: getRegionForCoordinates(actualX, actualY),
      });
      updateQuestion({ clicks: newClicks });
    } else {
      // Add new click
      updateQuestion({
        clicks: [
          ...question.clicks,
          {
            id: `click-${crypto.randomUUID()}`,
            x: actualX,
            y: actualY,
            regionId: getRegionForCoordinates(actualX, actualY),
          },
        ],
      });
    }
  };

  const getRegionForCoordinates = (x: number, y: number): string | undefined => {
    if (!question.regions) return undefined;

    for (const region of question.regions) {
      if (
        x >= region.x &&
        x <= region.x + region.width &&
        y >= region.y &&
        y <= region.y + region.height
      ) {
        return region.id;
      }
    }
    return undefined;
  };

  const removeClick = (clickId: string) => {
    updateQuestion({
      clicks: question.clicks.filter((c) => c.id !== clickId),
    });
  };

  const clearAllClicks = () => {
    updateQuestion({ clicks: [] });
  };

  const renderClickMarkers = () => {
    if (!imageRef.current || !question.imageUrl) return null;

    const rect = imageRef.current.getBoundingClientRect();

    return question.clicks.map((click, index) => {
      const relativeX = click.x / (question.imageWidth || 1);
      const relativeY = click.y / (question.imageHeight || 1);
      const displayX = relativeX * rect.width;
      const displayY = relativeY * rect.height;

      const region = question.regions?.find((r) => r.id === click.regionId);

      return (
        <div
          key={click.id}
          className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer"
          style={{ left: displayX, top: displayY }}
          onMouseEnter={() => setHoveredClick(click.id)}
          onMouseLeave={() => setHoveredClick(null)}
          title={region ? `Region: ${region.name}` : `Click ${index + 1}`}
        >
          {/* Marker Dot */}
          <div
            className={cn(
              'flex h-8 w-8 items-center justify-center rounded-full border-2 border-white shadow-lg transition-transform',
              hoveredClick === click.id ? 'scale-125 bg-red-500' : 'bg-brand-teal'
            )}
          >
            <span className="text-xs font-bold text-white">{index + 1}</span>
          </div>

          {/* Remove Button (on hover) */}
          {hoveredClick === click.id && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                removeClick(click.id);
              }}
              className="absolute -right-1 -top-1 rounded-full bg-red-500 p-0.5 text-white shadow-md hover:bg-red-600"
              title="Remove click"
              aria-label="Remove click point"
            >
              <X className="h-3 w-3" />
            </button>
          )}

          {/* Region Label (if in region) */}
          {region && hoveredClick === click.id && (
            <div className="absolute left-1/2 top-full mt-2 -translate-x-1/2 whitespace-nowrap rounded-md bg-gray-900 px-2 py-1 text-xs text-white shadow-lg">
              {region.name}
            </div>
          )}
        </div>
      );
    });
  };

  const renderRegions = () => {
    if (!imageRef.current || !question.imageUrl || !question.regions) return null;

    const rect = imageRef.current.getBoundingClientRect();

    return question.regions.map((region) => {
      const relativeX = region.x / (question.imageWidth || 1);
      const relativeY = region.y / (question.imageHeight || 1);
      const relativeWidth = region.width / (question.imageWidth || 1);
      const relativeHeight = region.height / (question.imageHeight || 1);

      const displayX = relativeX * rect.width;
      const displayY = relativeY * rect.height;
      const displayWidth = relativeWidth * rect.width;
      const displayHeight = relativeHeight * rect.height;

      const clicksInRegion = question.clicks.filter((c) => c.regionId === region.id).length;

      return (
        <div
          key={region.id}
          className="absolute border-2 border-dashed border-blue-500 bg-blue-500 bg-opacity-10"
          style={{
            left: displayX,
            top: displayY,
            width: displayWidth,
            height: displayHeight,
          }}
          title={`${region.name}: ${clicksInRegion} click${clicksInRegion !== 1 ? 's' : ''}`}
        >
          <div className="absolute left-1 top-1 rounded bg-blue-500 px-1.5 py-0.5 text-xs font-medium text-white shadow">
            {region.name} ({clicksInRegion})
          </div>
        </div>
      );
    });
  };

  return (
    <div className="space-y-4">
      {!question.imageUrl ? (
        <ImageUpload
          value={question.imageUrl}
          onChange={handleImageUpload}
          onClear={handleImageClear}
        />
      ) : (
        <>
          {/* Image with Click Tracking */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="h-4 w-4" />
                <span>
                  {question.clicks.length} / {question.maxClicks} click{question.maxClicks !== 1 ? 's' : ''} placed
                </span>
              </div>
              <div className="flex gap-2">
                {question.clicks.length > 0 && (
                  <button
                    onClick={clearAllClicks}
                    className="rounded-lg border border-red-300 px-3 py-1 text-xs font-medium text-red-600 transition-colors hover:bg-red-50"
                  >
                    Clear Clicks
                  </button>
                )}
                <button
                  onClick={handleImageClear}
                  className="rounded-lg border border-gray-300 px-3 py-1 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50"
                >
                  Change Image
                </button>
              </div>
            </div>

            <div
              ref={imageRef}
              onClick={handleImageClick}
              className="relative cursor-crosshair overflow-hidden rounded-lg border-2 border-gray-300 bg-gray-50"
            >
              <img
                src={question.imageUrl}
                alt="Heat map"
                className="w-full h-auto max-h-[500px] object-contain"
                draggable={false}
              />
              
              {/* Regions Overlay */}
              {renderRegions()}
              
              {/* Click Markers */}
              {renderClickMarkers()}
            </div>
          </div>

          {/* Instructions */}
          <div className="rounded-lg border border-blue-300 bg-blue-50 p-3">
            <div className="flex items-start gap-2">
              <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-600" />
              <div className="text-xs text-blue-800">
                <strong>Interactive Preview:</strong> Click anywhere on the image to place markers (max {question.maxClicks}). 
                Click existing markers to remove them. {question.regions && question.regions.length > 0 && 'Clicks are tracked by region.'}
                {question.clicks.length >= question.maxClicks && ' New clicks will replace the oldest ones.'}
              </div>
            </div>
          </div>

          {/* Click List (for debugging/visualization) */}
          {question.clicks.length > 0 && (
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
              <div className="mb-2 text-xs font-medium text-gray-700">Click Coordinates:</div>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
                {question.clicks.map((click, index) => {
                  const region = question.regions?.find((r) => r.id === click.regionId);
                  return (
                    <div
                      key={click.id}
                      className="flex items-center justify-between rounded-md border border-gray-300 bg-white px-2 py-1 text-xs"
                    >
                      <span>
                        {index + 1}. ({click.x}, {click.y})
                        {region && <span className="ml-1 text-blue-600">• {region.name}</span>}
                      </span>
                      <button
                        onClick={() => removeClick(click.id)}
                        className="rounded p-0.5 hover:bg-red-50"
                        title="Remove"
                      >
                        <X className="h-3 w-3 text-red-500" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
