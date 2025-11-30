import React from 'react';
import AnimatedShaderBackground from './components/ui/animated-shader-background';
import { Hero } from './components/Hero';

export default function App() {
  return (
    <div className="relative min-h-screen bg-black overflow-hidden">
      <AnimatedShaderBackground />
      <Hero />
    </div>
  );
}