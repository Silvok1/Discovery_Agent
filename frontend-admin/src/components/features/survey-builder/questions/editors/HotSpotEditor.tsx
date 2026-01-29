'use client';

import { HotSpotQuestion } from '@/api/contracts';
import { useSurveyBuilder } from '@/contexts/SurveyBuilderContext';
import { ImageUpload } from '@/components/ui/ImageUpload';
import { ThumbsUp, ThumbsDown, Plus, X, Edit2 } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface HotSpotEditorProps {
  blockId: string;
  question: HotSpotQuestion;
}

export function HotSpotEditor({ blockId, question }: HotSpotEditorProps) {
  const { dispatch } = useSurveyBuilder();
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawingShape, setDrawingShape] = useState<'rectangle' | 'polygon' | null>(null);
  const [polygonPoints, setPolygonPoints] = useState<Array<{ x: number; y: number }>>([]);
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null);
  const imageRef = useRef<HTMLDivElement>(null);

  const updateQuestion = (updates: Partial<HotSpotQuestion>) => {
    dispatch({
      type: 'UPDATE_QUESTION',
      payload: { blockId, question: { ...question, ...updates } },
    });
  };

  const handleImageUpload = (imageUrl: string, width: number, height: number) => {
    updateQuestion({ imageUrl, imageWidth: width, imageHeight: height });
  };

  const getRelativeCoordinates = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageRef.current) return { x: 0, y: 0 };
    const rect = imageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    return { x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) };
  };

  const isPointInRegion = (point: { x: number; y: number }, region: HotSpotQuestion['regions'][0]): boolean => {
    if (region.shape === 'rectangle' && region.x !== undefined && region.y !== undefined && region.width && region.height) {
      return (
        point.x >= region.x &&
        point.x <= region.x + region.width &&
        point.y >= region.y &&
        point.y <= region.y + region.height
      );
    } else if (region.shape === 'polygon' && region.points && region.points.length > 2) {
      // Point-in-polygon ray casting algorithm
      const points = region.points;
      let inside = false;
      for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
        const xi = points[i].x, yi = points[i].y;
        const xj = points[j].x, yj = points[j].y;
        const intersect = ((yi > point.y) !== (yj > point.y)) &&
          (point.x < (xj - xi) * (point.y - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
      }
      return inside;
    }
    return false;
  };

  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isDrawing) return; // Don't handle clicks while drawing
    
    const coords = getRelativeCoordinates(e);
    const clickedRegion = question.regions.find(r => isPointInRegion(coords, r));

    if (clickedRegion) {
      const updatedRegions = question.regions.map(r => {
        if (r.id !== clickedRegion.id) return r;

        if (question.mode === 'onOff') {
          return { ...r, selected: !r.selected, rating: null };
        } else {
          // likeDislike mode: cycle through null -> like -> dislike -> null
          let newRating: 'like' | 'dislike' | null = 'like';
          if (r.rating === null || r.rating === undefined) {
            newRating = 'like';
          } else if (r.rating === 'like') {
            newRating = 'dislike';
          } else {
            newRating = null;
          }
          return { ...r, rating: newRating, selected: false };
        }
      });
      updateQuestion({ regions: updatedRegions });
    }
  };

  const handleImageMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!question.showRegionOutlines) {
      const coords = getRelativeCoordinates(e);
      const hoveredReg = question.regions.find(r => isPointInRegion(coords, r));
      setHoveredRegion(hoveredReg?.id || null);
    }
  };

  const startDrawingRectangle = () => {
    setIsDrawing(true);
    setDrawingShape('rectangle');
    setStartPoint(null);
  };

  const startDrawingPolygon = () => {
    setIsDrawing(true);
    setDrawingShape('polygon');
    setPolygonPoints([]);
  };

  const handleDrawingClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDrawing) return;
    
    const coords = getRelativeCoordinates(e);

    if (drawingShape === 'rectangle') {
      if (!startPoint) {
        setStartPoint(coords);
      } else {
        // Complete rectangle
        const x = Math.min(startPoint.x, coords.x);
        const y = Math.min(startPoint.y, coords.y);
        const width = Math.abs(coords.x - startPoint.x);
        const height = Math.abs(coords.y - startPoint.y);

        const newRegion: HotSpotQuestion['regions'][0] = {
          id: `region-${crypto.randomUUID()}`,
          name: `Region ${question.regions.length + 1}`,
          shape: 'rectangle',
          x,
          y,
          width,
          height,
          selected: false,
          rating: null,
        };

        updateQuestion({ regions: [...question.regions, newRegion] });
        setIsDrawing(false);
        setDrawingShape(null);
        setStartPoint(null);
      }
    } else if (drawingShape === 'polygon') {
      // Add point to polygon
      const newPoints = [...polygonPoints, coords];
      setPolygonPoints(newPoints);
    }
  };

  const finishPolygon = () => {
    if (polygonPoints.length >= 3) {
      const newRegion: HotSpotQuestion['regions'][0] = {
        id: `region-${crypto.randomUUID()}`,
        name: `Region ${question.regions.length + 1}`,
        shape: 'polygon',
        points: polygonPoints,
        selected: false,
        rating: null,
      };

      updateQuestion({ regions: [...question.regions, newRegion] });
    }
    setIsDrawing(false);
    setDrawingShape(null);
    setPolygonPoints([]);
  };

  const cancelDrawing = () => {
    setIsDrawing(false);
    setDrawingShape(null);
    setStartPoint(null);
    setPolygonPoints([]);
  };

  const deleteRegion = (regionId: string) => {
    updateQuestion({ regions: question.regions.filter(r => r.id !== regionId) });
  };

  const getRegionStyle = (region: HotSpotQuestion['regions'][0]): React.CSSProperties => {
    let backgroundColor = 'rgba(59, 130, 246, 0.3)'; // Default blue
    let borderColor = 'rgb(59, 130, 246)';

    if (question.mode === 'onOff' && region.selected) {
      backgroundColor = 'rgba(34, 197, 94, 0.4)';
      borderColor = 'rgb(34, 197, 94)';
    } else if (question.mode === 'likeDislike') {
      if (region.rating === 'like') {
        backgroundColor = 'rgba(34, 197, 94, 0.4)'; // Green
        borderColor = 'rgb(34, 197, 94)';
      } else if (region.rating === 'dislike') {
        backgroundColor = 'rgba(239, 68, 68, 0.4)'; // Red
        borderColor = 'rgb(239, 68, 68)';
      }
    }

    const isVisible = question.showRegionOutlines || hoveredRegion === region.id || region.selected || region.rating;

    return {
      position: 'absolute',
      backgroundColor: isVisible ? backgroundColor : 'transparent',
      border: isVisible ? `2px solid ${borderColor}` : 'none',
      cursor: 'pointer',
      transition: 'all 0.2s',
      pointerEvents: 'auto',
    };
  };

  const renderRegion = (region: HotSpotQuestion['regions'][0]) => {
    if (region.shape === 'rectangle' && region.x !== undefined && region.y !== undefined && region.width && region.height) {
      return (
        <div
          key={region.id}
          style={{
            ...getRegionStyle(region),
            left: `${region.x}%`,
            top: `${region.y}%`,
            width: `${region.width}%`,
            height: `${region.height}%`,
          }}
          title={region.name}
        >
          {question.mode === 'likeDislike' && region.rating && (
            <div className="absolute inset-0 flex items-center justify-center">
              {region.rating === 'like' ? (
                <ThumbsUp className="h-6 w-6 text-green-600" />
              ) : (
                <ThumbsDown className="h-6 w-6 text-red-600" />
              )}
            </div>
          )}
        </div>
      );
    } else if (region.shape === 'polygon' && region.points && region.points.length > 0) {
      // For polygons, we'll use SVG overlay
      return null; // Rendered separately in SVG
    }
    return null;
  };

  const renderPolygonSVG = () => {
    if (!question.imageWidth || !question.imageHeight) return null;

    return (
      <svg
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
        }}
      >
        {question.regions
          .filter(r => r.shape === 'polygon' && r.points && r.points.length > 0)
          .map(region => {
            const points = region.points!;
            const pathData = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z';
            
            let fillColor = 'rgba(59, 130, 246, 0.3)';
            let strokeColor = 'rgb(59, 130, 246)';

            if (question.mode === 'onOff' && region.selected) {
              fillColor = 'rgba(34, 197, 94, 0.4)';
              strokeColor = 'rgb(34, 197, 94)';
            } else if (question.mode === 'likeDislike') {
              if (region.rating === 'like') {
                fillColor = 'rgba(34, 197, 94, 0.4)';
                strokeColor = 'rgb(34, 197, 94)';
              } else if (region.rating === 'dislike') {
                fillColor = 'rgba(239, 68, 68, 0.4)';
                strokeColor = 'rgb(239, 68, 68)';
              }
            }

            const isVisible = question.showRegionOutlines || hoveredRegion === region.id || region.selected || region.rating;

            return (
              <g key={region.id}>
                <path
                  d={pathData}
                  fill={isVisible ? fillColor : 'transparent'}
                  stroke={isVisible ? strokeColor : 'none'}
                  strokeWidth="2"
                  vectorEffect="non-scaling-stroke"
                  style={{ pointerEvents: 'auto', cursor: 'pointer' }}
                />
                {question.mode === 'likeDislike' && region.rating && (
                  <foreignObject
                    x={points.reduce((sum, p) => sum + p.x, 0) / points.length - 12}
                    y={points.reduce((sum, p) => sum + p.y, 0) / points.length - 12}
                    width="24"
                    height="24"
                  >
                    {region.rating === 'like' ? (
                      <ThumbsUp className="h-6 w-6 text-green-600" />
                    ) : (
                      <ThumbsDown className="h-6 w-6 text-red-600" />
                    )}
                  </foreignObject>
                )}
              </g>
            );
          })}
        {/* Show polygon being drawn */}
        {isDrawing && drawingShape === 'polygon' && polygonPoints.length > 0 && (
          <g>
            {polygonPoints.map((point, i) => (
              <circle key={i} cx={point.x} cy={point.y} r="4" fill="rgb(59, 130, 246)" />
            ))}
            {polygonPoints.length > 1 && (
              <polyline
                points={polygonPoints.map(p => `${p.x},${p.y}`).join(' ')}
                fill="none"
                stroke="rgb(59, 130, 246)"
                strokeWidth="2"
                strokeDasharray="4"
              />
            )}
          </g>
        )}
      </svg>
    );
  };

  if (!question.imageUrl) {
    return (
      <div className="mt-4">
        <ImageUpload onChange={handleImageUpload} />
        <p className="mt-2 text-xs text-gray-500">Upload an image to define clickable hot spot regions</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">


      {/* Image with regions */}
      <div className="relative border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
        <div
          ref={imageRef}
          className="relative"
          style={{ cursor: isDrawing ? 'crosshair' : 'pointer' }}
          onClick={isDrawing ? handleDrawingClick : handleImageClick}
          onMouseMove={handleImageMouseMove}
          onMouseLeave={() => setHoveredRegion(null)}
        >
          <img
            src={question.imageUrl}
            alt="Hot spot"
            className="w-full h-auto select-none"
            draggable={false}
          />
          
          {/* Render rectangle regions */}
          {question.regions
            .filter(r => r.shape === 'rectangle')
            .map(renderRegion)}
          
          {/* Render polygon regions via SVG */}
          {renderPolygonSVG()}

          {/* Show rectangle being drawn */}
          {isDrawing && drawingShape === 'rectangle' && startPoint && (
            <div
              style={{
                position: 'absolute',
                left: `${startPoint.x}%`,
                top: `${startPoint.y}%`,
                width: '20%',
                height: '20%',
                border: '2px dashed rgb(59, 130, 246)',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                pointerEvents: 'none',
              }}
            />
          )}
        </div>

        {/* Drawing controls overlay */}
        {isDrawing && (
          <div className="absolute top-2 left-2 right-2 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-3 border border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                <span className="text-sm font-medium text-gray-700">
                  {drawingShape === 'rectangle' ? 'Click two corners to draw rectangle' : `Drawing polygon (${polygonPoints.length} points)`}
                </span>
              </div>
              <div className="flex gap-2">
                {drawingShape === 'polygon' && polygonPoints.length >= 3 && (
                  <button
                    onClick={finishPolygon}
                    className="rounded bg-brand-teal px-3 py-1 text-xs font-medium text-white hover:bg-brand-teal/90"
                  >
                    Finish
                  </button>
                )}
                <button
                  onClick={cancelDrawing}
                  className="rounded bg-gray-200 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Region management */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium text-gray-700 uppercase tracking-wider">
            Regions ({question.regions.length})
          </p>
          {!isDrawing && (
            <div className="flex gap-1">
              <button
                onClick={startDrawingRectangle}
                className="rounded border border-gray-300 px-2 py-1 text-xs text-gray-600 hover:border-brand-teal hover:text-brand-teal"
              >
                + Rectangle
              </button>
              <button
                onClick={startDrawingPolygon}
                className="rounded border border-gray-300 px-2 py-1 text-xs text-gray-600 hover:border-brand-teal hover:text-brand-teal"
              >
                + Polygon
              </button>
            </div>
          )}
        </div>

        {question.regions.length === 0 ? (
          <p className="text-xs text-gray-500 py-2">No regions defined. Click buttons above to add.</p>
        ) : (
          <div className="space-y-1">
            {question.regions.map(region => (
              <div
                key={region.id}
                className="group flex items-center justify-between rounded border border-gray-200 p-2 hover:bg-gray-50"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-gray-700">{region.name}</span>
                  <span className="text-xs text-gray-400">({region.shape})</span>
                </div>
                <button
                  onClick={() => deleteRegion(region.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Mode indicator */}
      <div className="rounded-lg bg-blue-50 p-3 text-xs text-blue-800">
        <strong>Interaction Mode:</strong> {question.mode === 'onOff' ? 'On/Off (Click to select/deselect)' : 'Like/Dislike (Click to cycle: Like → Dislike → None)'}
      </div>
    </div>
  );
}
