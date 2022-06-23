import React, { RefObject, createRef, useEffect } from 'react';

import { WheelCanvasStyle } from './styles';
import { WheelData } from '../Wheel/types';
import { clamp } from '../../utils';

interface WheelCanvasProps extends DrawWheelProps {
  width: string;
  height: string;
  data: WheelData[];
}

interface DrawWheelProps {
  outerBorderColor: string;
  outerBorderWidth: number;
  innerRadius: number;
  innerBorderColor: string;
  innerBorderWidth: number;
  radiusLineColor: string;
  radiusLineWidth: number;
  fontSize: number;
  perpendicularText: boolean;
  textDistance: number;
}

const drawWheel = (
  canvasRef: RefObject<HTMLCanvasElement>,
  data: WheelData[],
  drawWheelProps: DrawWheelProps
) => {
  const QUANTITY = data.length;
  /* eslint-disable prefer-const */
  let {
    outerBorderColor,
    outerBorderWidth,
    innerRadius,
    innerBorderColor,
    innerBorderWidth,
    radiusLineColor,
    radiusLineWidth,
    fontSize,
    perpendicularText,
    textDistance,
  } = drawWheelProps;
  /* eslint-enable prefer-const */

  outerBorderWidth *= 2;
  innerBorderWidth *= 2;
  radiusLineWidth *= 2;
  fontSize *= 2;

  const canvas = canvasRef.current;
  if (canvas?.getContext('2d')) {
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
    ctx.clearRect(0, 0, 500, 500);
    ctx.strokeStyle = 'transparent';
    ctx.lineWidth = 0;
    // ctx.translate(0.5, 0.5)

    const arc = Math.PI / (QUANTITY / 2);
    const startAngle = 0;
    const outsideRadius = canvas.width / 2 - 10;

    const clampedTextDistance = clamp(0, 100, textDistance);
    const textRadius = (outsideRadius * clampedTextDistance) / 100;

    const clampedInsideRadius = clamp(0, 100, innerRadius);
    const insideRadius = (outsideRadius * clampedInsideRadius) / 100;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    ctx.font = `bold ${fontSize}px Helvetica, Arial`;

    const purpleSliceGradient = ctx.createRadialGradient(
      centerX,
      centerY,
      0,
      centerX,
      centerY,
      outsideRadius
    );
    purpleSliceGradient.addColorStop(0.4, 'rgba(133, 13, 177, 1)');
    purpleSliceGradient.addColorStop(0.7, 'rgba(164, 0, 186, 1)');
    purpleSliceGradient.addColorStop(0.8, 'rgba(133, 13, 177, 1)');

    const pinkSliceGradient = ctx.createRadialGradient(
      centerX,
      centerY,
      0,
      centerX,
      centerY,
      outsideRadius
    );
    pinkSliceGradient.addColorStop(0, 'rgba(246, 47, 169, 1)');
    // pinkSliceGradient.addColorStop(0.7, "rgba(150, 150, 150, 1)");
    pinkSliceGradient.addColorStop(1, 'rgba(178, 31, 121, 1)');

    const navySliceGradient = ctx.createRadialGradient(
      centerX,
      centerY,
      0,
      centerX,
      centerY,
      outsideRadius
    );
    navySliceGradient.addColorStop(0, 'rgb(89,9,156)');
    navySliceGradient.addColorStop(1, 'rgb(82,6,151)');

    const getSliceGradient = (index: number): CanvasGradient => {
      if (index % 4 === 0 || index % 4 === 2) return purpleSliceGradient;
      if (index % 4 === 1) return pinkSliceGradient;
      return navySliceGradient;
    };

    for (let i = 0; i < data.length; i++) {
      const angle = startAngle + i * arc;
      const { style } = data[i];
      ctx.fillStyle = getSliceGradient(i);

      ctx.beginPath();
      ctx.arc(centerX, centerY, outsideRadius, angle, angle + arc, false);
      ctx.arc(centerX, centerY, insideRadius, angle + arc, angle, true);
      ctx.stroke();
      ctx.fill();

      ctx.save();

      // WHEEL RADIUS LINES
      ctx.strokeStyle = radiusLineWidth <= 0 ? 'transparent' : radiusLineColor;
      ctx.lineWidth = radiusLineWidth;
      for (let j = 0; j < data.length; j++) {
        const radiusAngle = startAngle + j * arc;
        ctx.beginPath();
        ctx.moveTo(
          centerX + (insideRadius + 1) * Math.cos(radiusAngle),
          centerY + (insideRadius + 1) * Math.sin(radiusAngle)
        );
        ctx.lineTo(
          centerX + (outsideRadius - 1) * Math.cos(radiusAngle),
          centerY + (outsideRadius - 1) * Math.sin(radiusAngle)
        );
        ctx.closePath();
        ctx.stroke();
      }

      // WHEEL OUTER BORDER
      ctx.strokeStyle =
        outerBorderWidth <= 0 ? 'transparent' : outerBorderColor;
      ctx.lineWidth = outerBorderWidth;
      ctx.beginPath();
      ctx.arc(
        centerX,
        centerY,
        outsideRadius - ctx.lineWidth / 2,
        0,
        2 * Math.PI
      );
      ctx.closePath();
      ctx.stroke();

      // WHEEL INNER BORDER
      const grad = ctx.createRadialGradient(
        centerX,
        centerY,
        0,
        centerX,
        centerY,
        innerBorderWidth
      );

      grad.addColorStop(0, 'rgba(255, 0, 225, 1)');
      grad.addColorStop(1, 'rgba(133, 13, 177, 1)');
      console.log(innerBorderColor);

      ctx.strokeStyle = innerBorderWidth <= 0 ? 'transparent' : grad;
      ctx.lineWidth = innerBorderWidth;
      ctx.beginPath();
      ctx.arc(
        centerX,
        centerY,
        insideRadius + ctx.lineWidth / 2 - 1,
        0,
        2 * Math.PI
      );
      ctx.closePath();
      ctx.stroke();

      // TEXT FILL
      ctx.fillStyle = (style && style.textColor) as string;
      ctx.translate(
        centerX + Math.cos(angle + arc / 2) * textRadius,
        centerY + Math.sin(angle + arc / 2) * textRadius
      );
      const text = data[i].option;
      const textRotationAngle = perpendicularText
        ? angle + arc / 2 + Math.PI / 2
        : angle + arc / 2;
      ctx.rotate(textRotationAngle);
      ctx.fillText(text, -ctx.measureText(text).width / 2, fontSize / 2.7);
      ctx.restore();
    }

    // TODO: WHEEL BORDER DECORATIONS
    ctx.beginPath();
    // ctx.moveTo(
    //   centerX + (outsideRadius - 1) + outerBorderWidth * 0,
    //   centerY + (outsideRadius - 1) + outerBorderWidth * 1
    // );
    ctx.fillStyle = 'green';

    const cursorX = centerX + (outsideRadius - 1) * Math.cos(0);
    const cursorY = centerY + (outsideRadius - 1) * Math.sin(0);
    ctx.arc(cursorX, cursorY, 5, 0, 2 * Math.PI);
    ctx.fill();
  }
};

const WheelCanvas = ({
  width,
  height,
  data,
  outerBorderColor,
  outerBorderWidth,
  innerRadius,
  innerBorderColor,
  innerBorderWidth,
  radiusLineColor,
  radiusLineWidth,
  fontSize,
  perpendicularText,
  textDistance,
}: WheelCanvasProps): JSX.Element => {
  const canvasRef = createRef<HTMLCanvasElement>();
  const drawWheelProps = {
    outerBorderColor,
    outerBorderWidth,
    innerRadius,
    innerBorderColor,
    innerBorderWidth,
    radiusLineColor,
    radiusLineWidth,
    fontSize,
    perpendicularText,
    textDistance,
  };

  useEffect(() => {
    drawWheel(canvasRef, data, drawWheelProps);
  }, [canvasRef, data, drawWheelProps]);

  return <WheelCanvasStyle ref={canvasRef} width={width} height={height} />;
};

export default WheelCanvas;
