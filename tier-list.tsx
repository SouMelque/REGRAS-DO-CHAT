"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Trash2, X, Monitor, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"

/* ---------- types ---------- */
interface TierItem {
  id: string
  name: string
  image: string
}
interface TierRow {
  id: string
  label: string
  items: TierItem[]
}

/* ---------- component ---------- */
export default function TierList() {
  /* ---------- state ---------- */
  const [draggedItem, setDraggedItem] = useState<TierItem | null>(null)
  const [draggedFromTier, setDraggedFromTier] = useState<string | null>(null)
  const [showClearMessage, setShowClearMessage] = useState(false)
  const [countdown, setCountdown] = useState(3)
  const [progress, setProgress] = useState(100)
  const [showMobileWarning, setShowMobileWarning] = useState(false)
  const [showMobileModal, setShowMobileModal] = useState(false)

  const [tiers, setTiers] = useState<TierRow[]>([
    { id: "S", label: "S", items: [] },
    { id: "A", label: "A", items: [] },
    { id: "B", label: "B", items: [] },
    { id: "C", label: "C", items: [] },
    { id: "D", label: "D", items: [] },
    { id: "E", label: "E", items: [] },
    { id: "F", label: "F", items: [] },
    { id: "BOTTOM", label: "", items: [] },
  ])

  /* ---------- localStorage functions ---------- */
  const saveTiersToStorage = (tiersData: TierRow[]) => {
    try {
      localStorage.setItem("tierlist-data", JSON.stringify(tiersData))
    } catch (error) {
      console.error("Erro ao salvar dados:", error)
    }
  }

  const loadTiersFromStorage = () => {
    try {
      const saved = localStorage.getItem("tierlist-data")
      if (saved) {
        const parsedData = JSON.parse(saved)
        setTiers(parsedData)
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error)
    }
  }

  /* ---------- image conversion functions ---------- */
  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
  }

  /* ---------- load data on mount ---------- */
  useEffect(() => {
    loadTiersFromStorage()
  }, [])

  /* ---------- save data when tiers change ---------- */
  useEffect(() => {
    saveTiersToStorage(tiers)
  }, [tiers])

  /* ---------- mobile detection ---------- */
  useEffect(() => {
    const checkMobile = () => {
      const isMobile =
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
        window.innerWidth < 768

      if (isMobile) {
        setShowMobileModal(true)
      }
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  /* ---------- countdown effect ---------- */
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (showClearMessage && countdown > 0) {
      interval = setInterval(() => {
        setCountdown((prev) => prev - 1)
        setProgress((prev) => prev - 33.33)
      }, 1000)
    } else if (countdown === 0) {
      setShowClearMessage(false)
      setCountdown(3)
      setProgress(100)
    }
    return () => clearInterval(interval)
  }, [showClearMessage, countdown])

  /* ---------- paste handler ---------- */
  useEffect(() => {
    const handlePaste = async (e: ClipboardEvent) => {
      const items = e.clipboardData?.items
      if (!items) return

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf("image") !== -1) {
          const blob = items[i].getAsFile()
          if (blob) {
            try {
              // Convert blob to base64
              const base64Image = await blobToBase64(blob)
              const newItem: TierItem = {
                id: Date.now().toString(),
                name: `Item ${Date.now()}`,
                image: base64Image, // Save as base64 instead of blob URL
              }

              // Add to S tier by default
              setTiers((prev) => prev.map((t) => (t.id === "S" ? { ...t, items: [...t.items, newItem] } : t)))
            } catch (error) {
              console.error("Erro ao processar imagem:", error)
            }
          }
        }
      }
    }

    document.addEventListener("paste", handlePaste)
    return () => document.removeEventListener("paste", handlePaste)
  }, [])

  /* ---------- drag helpers ---------- */
  const handleDragStart = (item: TierItem, from: string) => {
    setDraggedItem(item)
    setDraggedFromTier(from)
  }

  const handleDragOver = (e: React.DragEvent) => e.preventDefault()

  const dropItem = (targetTierId: string) => {
    if (!draggedItem || !draggedFromTier) return

    /* remove from source */
    setTiers((prev) =>
      prev.map((t) =>
        t.id === draggedFromTier ? { ...t, items: t.items.filter((it) => it.id !== draggedItem.id) } : t,
      ),
    )

    /* add to destination */
    setTiers((prev) => prev.map((t) => (t.id === targetTierId ? { ...t, items: [...t.items, draggedItem] } : t)))

    /* reset */
    setDraggedItem(null)
    setDraggedFromTier(null)
  }

  /* ---------- actions ---------- */
  const clearAllTiers = () => {
    setTiers((prev) => prev.map((t) => ({ ...t, items: [] })))
    localStorage.removeItem("tierlist-data") // Limpa também do localStorage
    setShowClearMessage(true)
    setCountdown(3)
    setProgress(100)
  }

  const removeItem = (itemId: string, tierId: string) => {
    setTiers((prev) =>
      prev.map((t) => (t.id === tierId ? { ...t, items: t.items.filter((item) => item.id !== itemId) } : t)),
    )
  }

  const handleProceedMobile = () => {
    setShowMobileModal(false)
    setShowMobileWarning(true)
  }

  /* ---------- render ---------- */
  return (
    <div className="min-h-screen bg-black text-white relative" style={{ minHeight: "100vh", height: "auto" }}>
      {/* MOBILE MODAL */}
      {showMobileModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 border-2 border-red-600 rounded-lg p-6 max-w-md w-full text-center shadow-2xl">
            <Monitor className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2
              className="text-2xl font-bold text-white mb-4"
              style={{
                fontFamily: "Creepster, cursive, serif",
                letterSpacing: "1px",
              }}
            >
              AVISO IMPORTANTE
            </h2>
            <p className="text-gray-300 mb-6 leading-relaxed">
              Esta tier list foi otimizada para desktop. Para a melhor experiência, recomendamos fortemente o uso de um
              computador ou laptop.
            </p>
            <p className="text-red-400 text-sm mb-6">
              Algumas funcionalidades podem não funcionar corretamente em dispositivos móveis.
            </p>
            <Button
              onClick={handleProceedMobile}
              className="w-full bg-red-600 hover:bg-red-700 text-white border-2 border-red-500"
              style={{
                fontFamily: "Creepster, cursive, serif",
                letterSpacing: "1px",
              }}
            >
              PROSSEGUIR MESMO ASSIM
            </Button>
          </div>
        </div>
      )}

      {/* MOBILE WARNING BAR */}
      {showMobileWarning && (
        <div className="fixed top-0 left-0 right-0 bg-red-600 text-white px-4 py-3 z-40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Monitor className="w-5 h-5" />
            <span className="text-sm font-medium">
              Para melhor experiência, recomendamos usar um desktop ou computador
            </span>
          </div>
          <button
            onClick={() => setShowMobileWarning(false)}
            className="text-white hover:text-gray-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* CLEAR MESSAGE */}
      {showClearMessage && (
        <div className="fixed bottom-6 right-6 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 shadow-lg z-50 flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <span className="text-white text-sm">A tierlist foi limpa!</span>
          <div className="w-16 h-1 bg-gray-600 rounded-full overflow-hidden ml-2">
            <div
              className="h-full bg-red-500 transition-all duration-1000 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* HEADER */}
      <header className={`flex items-center justify-center px-6 py-8 relative ${showMobileWarning ? "mt-12" : ""}`}>
        <img
          src="/logo-sexta-terror-new.png"
          alt="Sexta do Terror"
          className="h-48 w-auto object-contain"
          style={{
            animation: "heartbeat 2s ease-in-out infinite",
          }}
        />
      </header>

      {/* CSS ANIMATION */}
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Creepster&display=swap');
        
        @keyframes heartbeat {
          0% { transform: scale(1); }
          14% { transform: scale(1.05); }
          28% { transform: scale(1); }
          42% { transform: scale(1.05); }
          70% { transform: scale(1); }
        }

        /* Fix para remover scroll horizontal e listra branca */
        html, body {
          overflow-x: hidden;
          background-color: #000000;
          margin: 0;
          padding: 0;
        }
        
        * {
          box-sizing: border-box;
        }
      `}</style>

      {/* TIERS */}
      <main className="max-w-6xl mx-auto px-6 bg-black pb-8">
        {/* TIER LIST PRINCIPAL - S, A, B, C, D, E, F */}
        {tiers
          .filter((tier) => tier.id !== "BOTTOM")
          .map((tier, index) => (
            <section key={tier.id} className="flex items-center mb-6 relative">
              {/* BOTÕES NO TIER S */}
              {tier.id === "S" && (
                <div className="absolute -top-12 right-0 flex gap-2 z-10">
                  <Button
                    onClick={clearAllTiers}
                    size="sm"
                    className="bg-black hover:bg-gray-800 text-white border-2 border-white"
                    style={{
                      fontFamily: "Creepster, cursive, serif",
                      letterSpacing: "1px",
                    }}
                  >
                    <Trash2 className="w-3 h-3 mr-1 text-white" /> LIMPAR
                  </Button>
                  <Button
                    onClick={() => {}}
                    size="sm"
                    className="bg-black hover:bg-gray-800 text-white border-2 border-white p-2"
                    style={{
                      fontFamily: "Creepster, cursive, serif",
                    }}
                  >
                    <Settings className="w-4 h-4 text-white" />
                  </Button>
                </div>
              )}

              {/* LABEL AO LADO */}
              <div className="w-20 h-20 flex items-center justify-center mr-4 rounded-lg border-2 border-white shadow-xl bg-black">
                <span
                  className="text-white text-3xl font-bold select-none"
                  style={{
                    fontFamily: "Creepster, cursive, serif",
                    textShadow: "2px 2px 4px rgba(0,0,0,0.8), 0 0 8px rgba(255,255,255,0.3)",
                    filter: "drop-shadow(1px 1px 2px rgba(0,0,0,0.9))",
                    letterSpacing: "2px",
                  }}
                >
                  {tier.label}
                </span>
              </div>

              {/* DROP ZONE */}
              <div
                className="flex-1 h-20 flex items-center gap-2 px-4 overflow-x-auto relative rounded-lg border-2 border-white shadow-2xl"
                style={{
                  background: "linear-gradient(135deg, #111827 0%, #1f2937 50%, #111827 100%)",
                  backgroundImage: `url('/tier-background.jpg')`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  backgroundBlendMode: "overlay",
                }}
                onDragOver={handleDragOver}
                onDrop={() => dropItem(tier.id)}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/20 pointer-events-none rounded-lg"></div>
                <div className="absolute inset-0 bg-black/10 pointer-events-none rounded-lg"></div>
                {tier.items.map((item) => (
                  <div key={item.id} className="relative group flex-shrink-0">
                    <div className="relative p-1.5 bg-gradient-to-br from-gray-700 via-gray-800 to-gray-900 rounded-lg border border-gray-500 shadow-xl hover:shadow-2xl transition-all duration-200">
                      <img
                        src={item.image || "/placeholder.svg"}
                        alt={item.name}
                        draggable
                        onDragStart={() => handleDragStart(item, tier.id)}
                        className="max-w-28 max-h-14 object-contain cursor-move hover:scale-105 transition-transform relative z-10 rounded"
                        style={{ width: "auto", height: "auto", minWidth: "40px", minHeight: "40px" }}
                        onError={(e) => {
                          console.error("Erro ao carregar imagem:", item.image)
                          e.currentTarget.src = "/placeholder.svg"
                        }}
                      />
                      {/* TIER BADGE */}
                      <div className="absolute top-0 left-0 w-4 h-4 bg-white rounded-br-lg flex items-center justify-center z-20 shadow-lg">
                        <span className="text-black text-xs font-bold leading-none">{tier.label}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => removeItem(item.id, tier.id)}
                      className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-30 shadow-lg"
                    >
                      <X className="w-3 h-3 text-white" />
                    </button>
                  </div>
                ))}
              </div>
            </section>
          ))}

        {/* SEÇÃO PROFUNDEZA */}
        <div className="my-12 flex justify-center">
          <h2
            className="text-white text-6xl font-bold select-none"
            style={{
              fontFamily: "Creepster, cursive, serif",
              textShadow: "3px 3px 6px rgba(0,0,0,0.9), 0 0 12px rgba(255,255,255,0.4)",
              filter: "drop-shadow(2px 2px 4px rgba(0,0,0,0.9))",
              letterSpacing: "3px",
            }}
          >
            PROFUNDEZA
          </h2>
        </div>

        {/* TIER ABAIXO DE PROFUNDEZA */}
        {tiers
          .filter((tier) => tier.id === "BOTTOM")
          .map((tier) => (
            <section key={tier.id} className="mb-8 -mt-2">
              <div
                className="h-20 flex items-center gap-2 px-4 overflow-x-auto relative rounded-lg border-2 border-white shadow-2xl"
                style={{
                  background: "linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #0f0f23 100%)",
                  backgroundImage: `url('/tier-background.jpg')`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  backgroundBlendMode: "overlay",
                  filter: "brightness(0.7)",
                }}
                onDragOver={handleDragOver}
                onDrop={() => dropItem(tier.id)}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-transparent to-white/5 pointer-events-none rounded-lg"></div>
                <div className="absolute inset-0 bg-black/20 pointer-events-none rounded-lg"></div>
                {tier.items.map((item) => (
                  <div key={item.id} className="relative group flex-shrink-0">
                    <div className="relative p-1.5 bg-gradient-to-br from-gray-600 via-gray-700 to-gray-800 rounded-lg border border-white/50 shadow-xl hover:shadow-2xl transition-all duration-200 opacity-90">
                      <img
                        src={item.image || "/placeholder.svg"}
                        alt={item.name}
                        draggable
                        onDragStart={() => handleDragStart(item, tier.id)}
                        className="max-w-28 max-h-14 object-contain cursor-move hover:scale-105 transition-transform relative z-10 rounded"
                        style={{ width: "auto", height: "auto", minWidth: "40px", minHeight: "40px" }}
                        onError={(e) => {
                          console.error("Erro ao carregar imagem:", item.image)
                          e.currentTarget.src = "/placeholder.svg"
                        }}
                      />
                      {/* TIER BADGE - Para tier abaixo de profundeza, usa "P" */}
                      <div className="absolute top-0 left-0 w-4 h-4 bg-white rounded-br-lg flex items-center justify-center z-20 shadow-lg">
                        <span className="text-black text-xs font-bold leading-none">P</span>
                      </div>
                    </div>
                    <button
                      onClick={() => removeItem(item.id, tier.id)}
                      className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-30 shadow-lg"
                    >
                      <X className="w-3 h-3 text-white" />
                    </button>
                  </div>
                ))}
              </div>
            </section>
          ))}
      </main>
    </div>
  )
}
