// 'use client';

// import React, { useState, useRef, useEffect } from 'react';

// interface AudioPlayerProps {
//   title: string;
//   audioUrl?: string;
// }

// const AudioPlayer: React.FC<AudioPlayerProps> = ({ title, audioUrl }) => {
//   const [isPlaying, setIsPlaying] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const [canPlay, setCanPlay] = useState(false);
//   const audioRef = useRef<HTMLAudioElement | null>(null);

//   // Check if the audio file exists
//   useEffect(() => {
//     const checkAudioFile = async () => {
//       if (!audioUrl) return;

//       try {
//         const response = await fetch(audioUrl, { method: 'HEAD' });
//         if (!response.ok) {
//           throw new Error(`HTTP error! status: ${response.status}`);
//         }
//         // File exists and is accessible
//       } catch (error) {
//         console.error('Audio file check failed:', error);
//         setError('Audio file not found or inaccessible.');
//         setIsLoading(false);
//         setCanPlay(false);
//       }
//     };

//     checkAudioFile();
//   }, [audioUrl]);

//   useEffect(() => {
//     // Reset states when audio URL changes
//     setIsPlaying(false);
//     setError(null);
//     setIsLoading(true);
//     setCanPlay(false);

//     if (!audioUrl) return;

//     try {
//       const audio = new Audio();
      
//       // Set up event listeners before setting the source
//       audio.addEventListener('canplaythrough', handleCanPlay);
//       audio.addEventListener('error', handleError);
//       audio.addEventListener('ended', handleEnded);
//       audio.addEventListener('loadstart', () => setIsLoading(true));
//       audio.addEventListener('waiting', () => setIsLoading(true));
//       audio.addEventListener('playing', () => setIsLoading(false));
      
//       // Set audio properties
//       audio.preload = 'auto';
//       audio.src = audioUrl;

//       // Store the audio element
//       audioRef.current = audio;

//       // Clean up
//       return () => {
//         audio.removeEventListener('canplaythrough', handleCanPlay);
//         audio.removeEventListener('error', handleError);
//         audio.removeEventListener('ended', handleEnded);
//         audio.pause();
//         audio.src = '';
//         audioRef.current = null;
//       };
//     } catch (error) {
//       console.error('Audio initialization error:', error);
//       setError('Failed to initialize audio player.');
//       setIsLoading(false);
//       setCanPlay(false);
//     }
//   }, [audioUrl]);

//   const handleCanPlay = () => {
//     if (!audioRef.current) return;
//     setIsLoading(false);
//     setCanPlay(true);
//     setError(null);
//   };

//   const handleEnded = () => {
//     setIsPlaying(false);
//   };

//   const handleError = (e: Event) => {
//     const target = e.target as HTMLAudioElement;
//     const mediaError = target.error;
//     let errorMessage = 'Failed to load audio.';

//     if (mediaError) {
//       switch (mediaError.code) {
//         case MediaError.MEDIA_ERR_ABORTED:
//           errorMessage = 'Audio loading aborted.';
//           break;
//         case MediaError.MEDIA_ERR_NETWORK:
//           errorMessage = 'Network error while loading audio.';
//           break;
//         case MediaError.MEDIA_ERR_DECODE:
//           errorMessage = 'Error decoding audio file.';
//           break;
//         case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
//           errorMessage = 'Audio file not supported.';
//           break;
//       }

//       console.error('Audio error:', {
//         code: mediaError.code,
//         message: mediaError.message
//       });
//     }

//     setError(`${errorMessage} Please try again.`);
//     setIsLoading(false);
//     setIsPlaying(false);
//     setCanPlay(false);
//   };

//   const handlePlay = async () => {
//     if (!audioRef.current || !canPlay) return;

//     try {
//       if (isPlaying) {
//         await audioRef.current.pause();
//         setIsPlaying(false);
//       } else {
//         setIsLoading(true);
//         await audioRef.current.play();
//         setIsPlaying(true);
//         setError(null);
//       }
//     } catch (error) {
//       console.error('Playback error:', error);
//       setError('Failed to play audio. Please try again.');
//       setIsPlaying(false);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className="p-6 bg-gray-800/50 rounded-lg">
//       <div className="flex items-center justify-center space-x-4">
//         <button
//           onClick={handlePlay}
//           className="p-3 rounded-full bg-purple-600 hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
//           disabled={!audioUrl || isLoading || !canPlay}
//           title={isPlaying ? "Pause" : "Play"}
//         >
//           {isLoading ? (
//             <svg className="animate-spin h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//               <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//               <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//             </svg>
//           ) : isPlaying ? (
//             <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
//               <path fillRule="evenodd" clipRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" />
//             </svg>
//           ) : (
//             <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
//               <path fillRule="evenodd" clipRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
//             </svg>
//           )}
//         </button>
//         <div className="text-sm text-gray-300">{title}</div>
//       </div>
//       {error && (
//         <div className="mt-2 text-sm text-red-400 text-center">{error}</div>
//       )}
//     </div>
//   );
// };

// export default AudioPlayer; 