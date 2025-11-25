import * as THREE from 'three';

export const COLORS = {
  EMERALD: '#046335', // Slightly brighter for depth against deep
  DEEP_GREEN: '#011c0d', // Almost black-green
  GOLD: '#FFD700',
  CHAMPAGNE: '#F7E7CE',
  RED_VELVET: '#800020',
  WARM_LIGHT: '#ffaa33',
  STAR_WHITE: '#fffef0' // Yellowish white for the star
};

export const CONFIG = {
  PARTICLE_COUNT: 135000, // Tripled from 45k for extreme density
  ORNAMENT_COUNT: 600, 
  GIFT_COUNT: 120,
  TREE_HEIGHT: 18, 
  TREE_RADIUS_BOTTOM: 7.5, 
  CHAOS_RADIUS: 35, 
};

// Reusable vector to avoid GC
export const _tempVec = new THREE.Vector3();
export const _tempColor = new THREE.Color();
export const _tempMatrix = new THREE.Matrix4();
export const _tempObj = new THREE.Object3D();