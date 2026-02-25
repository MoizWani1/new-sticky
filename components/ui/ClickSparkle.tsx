'use client'

import { useEffect } from 'react'

export default function ClickSparkle() {
    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            // Create sparkle element
            const sparkle = document.createElement('div')
            sparkle.classList.add('click-sparkle')

            // Position it at cursor
            sparkle.style.left = `${e.clientX}px`
            sparkle.style.top = `${e.clientY}px`

            // Add to body
            document.body.appendChild(sparkle)

            // Remove after animation
            setTimeout(() => {
                sparkle.remove()
            }, 800)
        }

        window.addEventListener('click', handleClick)

        return () => {
            window.removeEventListener('click', handleClick)
        }
    }, [])

    return (
        <style jsx global>{`
      .click-sparkle {
        position: fixed;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background: radial-gradient(circle, #D4AF37 0%, transparent 70%);
        pointer-events: none;
        z-index: 9999;
        transform: translate(-50%, -50%) scale(0);
        animation: sparkle-anim 0.6s ease-out forwards;
        box-shadow: 0 0 10px #D4AF37;
      }

      @keyframes sparkle-anim {
        0% {
          transform: translate(-50%, -50%) scale(0);
          opacity: 1;
        }
        50% {
          opacity: 0.8;
          transform: translate(-50%, -50%) scale(1.5);
        }
        100% {
          transform: translate(-50%, -50%) scale(2);
          opacity: 0;
        }
      }
    `}</style>
    )
}
