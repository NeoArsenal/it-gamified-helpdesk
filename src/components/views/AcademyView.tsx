import { useState, useEffect } from 'react';
import { BookOpen, Star, Lock, Play, CheckCircle2, XCircle, ShieldCheck, Trophy, Zap, Target, Sparkles } from 'lucide-react';
import { getCursosAcademia, getNivelPreguntas, completarNivelAcademia } from '@/services/api/api-client';

export function AcademyView({ userId = 'JD', onXPGained }: { userId?: string, onXPGained?: () => void }) {
  const [cursos, setCursos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Quiz State
  const [activeNivel, setActiveNivel] = useState<any>(null);
  const [preguntas, setPreguntas] = useState<any[]>([]);
  const [preguntaIndex, setPreguntaIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [quizStatus, setQuizStatus] = useState<'idle' | 'correct' | 'incorrect' | 'finished'>('idle');
  const [earnedXP, setEarnedXP] = useState(0);

  // Track results per question: true = correct, false = incorrect
  const [answers, setAnswers] = useState<boolean[]>([]);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await getCursosAcademia(userId);
      setCursos(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [userId]);

  const openQuiz = async (nivel: any) => {
    if (!nivel.isUnlocked && !nivel.isCompleted) return;
    try {
      const data = await getNivelPreguntas(nivel.id);
      setPreguntas(data.preguntas || []);
      setActiveNivel(nivel);
      setPreguntaIndex(0);
      setSelectedOption(null);
      setQuizStatus('idle');
      setAnswers([]);
    } catch (e) {
      console.error('Error opening quiz', e);
    }
  };

  const handleComprobar = () => {
    if (selectedOption === null) return;
    const currentQ = preguntas[preguntaIndex];
    const isCorrect = selectedOption === currentQ.respuestaCorrecta;
    setAnswers(prev => [...prev, isCorrect]);
    setQuizStatus(isCorrect ? 'correct' : 'incorrect');
  };

  const handleContinuar = async () => {
    if (preguntaIndex < preguntas.length - 1) {
      setPreguntaIndex(prev => prev + 1);
      setSelectedOption(null);
      setQuizStatus('idle');
    } else {
      setQuizStatus('finished');
      try {
        const res = await completarNivelAcademia(userId, activeNivel.id);
        if (res.xpOtorgado > 0) {
          setEarnedXP(res.xpOtorgado);
          if (onXPGained) onXPGained();
        }
      } catch (e) {
        console.error('Error completing', e);
      }
    }
  };

  const closeQuiz = () => {
    setActiveNivel(null);
    setEarnedXP(0);
    loadData();
  };

  if (loading) {
    return (
      <div className="p-8 flex justify-center items-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-full border-4 border-indigo-100 border-t-indigo-600 animate-spin"></div>
            <Sparkles className="w-6 h-6 text-amber-400 absolute -top-1 -right-1 animate-pulse" />
          </div>
          <p className="text-slate-500 font-medium animate-pulse">Cargando tu camino...</p>
        </div>
      </div>
    );
  }

  const curso = cursos[0];
  const niveles = curso?.niveles || [];
  const completados = niveles.filter((n: any) => n.isCompleted).length;
  const totalNiveles = niveles.length;
  const progresoPct = totalNiveles > 0 ? Math.round((completados / totalNiveles) * 100) : 0;
  const totalXPCurso = niveles.reduce((s: number, n: any) => s + (n.xpRecompensa || 0), 0);
  const xpGanado = niveles.filter((n: any) => n.isCompleted).reduce((s: number, n: any) => s + (n.xpRecompensa || 0), 0);

  // Color palette for nodes
  const nodeColors = [
    { bg: 'from-violet-500 to-purple-600', glow: 'shadow-violet-400/50', border: 'border-violet-300', light: 'bg-violet-100 text-violet-700' },
    { bg: 'from-cyan-500 to-blue-600', glow: 'shadow-cyan-400/50', border: 'border-cyan-300', light: 'bg-cyan-100 text-cyan-700' },
    { bg: 'from-emerald-500 to-teal-600', glow: 'shadow-emerald-400/50', border: 'border-emerald-300', light: 'bg-emerald-100 text-emerald-700' },
    { bg: 'from-orange-500 to-red-600', glow: 'shadow-orange-400/50', border: 'border-orange-300', light: 'bg-orange-100 text-orange-700' },
    { bg: 'from-pink-500 to-rose-600', glow: 'shadow-pink-400/50', border: 'border-pink-300', light: 'bg-pink-100 text-pink-700' },
  ];

  return (
    <div className="p-6 lg:p-10 max-w-5xl mx-auto min-h-[calc(100vh-4rem)]">
      
      {/* ═══════════ HERO HEADER ═══════════ */}
      <div className="relative mb-12 bg-gradient-to-br from-slate-900 via-indigo-950 to-violet-950 rounded-3xl p-8 lg:p-10 overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-bl from-indigo-500/20 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-56 h-56 bg-gradient-to-tr from-violet-500/15 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute top-8 right-16 w-2 h-2 bg-amber-400 rounded-full animate-ping"></div>
        <div className="absolute top-20 right-32 w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse"></div>
        <div className="absolute bottom-12 left-24 w-1 h-1 bg-emerald-400 rounded-full animate-ping" style={{ animationDelay: '1s' }}></div>

        <div className="relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/30">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-black text-white tracking-tight">Academia TI</h1>
                  <p className="text-indigo-300 text-sm font-medium mt-0.5">Domina las redes paso a paso</p>
                </div>
              </div>
              <p className="text-slate-400 text-sm max-w-md mt-2 leading-relaxed">
                Completa cada nivel para desbloquear el siguiente. Responde correctamente las preguntas y gana XP para subir de rango.
              </p>
            </div>

            {/* Stats */}
            <div className="flex gap-4">
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl px-5 py-4 min-w-[120px] text-center">
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <Target className="w-4 h-4 text-indigo-400" />
                  <span className="text-2xl font-black text-white">{completados}/{totalNiveles}</span>
                </div>
                <span className="text-xs text-slate-400 font-medium">Niveles</span>
              </div>
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl px-5 py-4 min-w-[120px] text-center">
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span className="text-2xl font-black text-white">{xpGanado}</span>
                </div>
                <span className="text-xs text-slate-400 font-medium">XP Ganado</span>
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Progreso del Curso: {curso?.titulo}</span>
              <span className="text-xs font-bold text-indigo-400">{progresoPct}%</span>
            </div>
            <div className="h-3 bg-white/10 rounded-full overflow-hidden backdrop-blur-sm">
              <div 
                className="h-full bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500 rounded-full transition-all duration-1000 ease-out relative"
                style={{ width: `${progresoPct}%` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════ LEARNING PATH ═══════════ */}
      <div className="relative pb-20">
        {niveles.map((nivel: any, index: number) => {
          const isLeft = index % 2 === 0;
          const color = nodeColors[index % nodeColors.length];
          const isLast = index === niveles.length - 1;

          return (
            <div key={nivel.id} className="relative">
              {/* Connector Line (SVG curve) */}
              {!isLast && (
                <div className="absolute left-1/2 -translate-x-1/2 top-[88px] z-0" style={{ height: '100px' }}>
                  <svg width="200" viewBox="0 0 200 100" className="overflow-visible" style={{ marginLeft: isLeft ? '-20px' : '-180px' }}>
                    <path
                      d={isLeft ? 'M 100 0 Q 100 50 180 100' : 'M 100 0 Q 100 50 20 100'}
                      stroke={nivel.isCompleted ? '#a78bfa' : '#e2e8f0'}
                      strokeWidth="4"
                      fill="none"
                      strokeDasharray={nivel.isCompleted ? '0' : '8 8'}
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
              )}

              {/* Node + Card */}
              <div className={`flex items-center gap-6 mb-16 relative z-10 ${isLeft ? 'flex-row' : 'flex-row-reverse'}`}>
                {/* ── The Node Circle ── */}
                <div className="flex-1 flex justify-end" style={isLeft ? {} : { justifyContent: 'flex-start' }}>
                  <button
                    onClick={() => openQuiz(nivel)}
                    disabled={!nivel.isUnlocked && !nivel.isCompleted}
                    className={`relative group transition-all duration-500 ${nivel.isUnlocked && !nivel.isCompleted ? 'hover:scale-110' : nivel.isCompleted ? 'hover:scale-105' : ''}`}
                  >
                    {/* Outer glow ring for current level */}
                    {nivel.isUnlocked && !nivel.isCompleted && (
                      <>
                        <div className={`absolute inset-[-8px] rounded-full bg-gradient-to-r ${color.bg} opacity-30 animate-ping`}></div>
                        <div className={`absolute inset-[-4px] rounded-full bg-gradient-to-r ${color.bg} opacity-20 blur-sm`}></div>
                      </>
                    )}

                    {/* Circle */}
                    <div className={`w-[88px] h-[88px] rounded-full flex items-center justify-center relative
                      ${nivel.isCompleted 
                        ? `bg-gradient-to-br from-amber-400 to-orange-500 shadow-xl shadow-amber-400/40 border-4 border-amber-300` 
                        : nivel.isUnlocked 
                          ? `bg-gradient-to-br ${color.bg} shadow-xl ${color.glow} border-4 ${color.border}` 
                          : 'bg-slate-200 border-4 border-slate-100 shadow-inner'
                      }`}
                    >
                      {nivel.isCompleted ? (
                        <Star className="w-10 h-10 text-white fill-white drop-shadow-sm" />
                      ) : nivel.isUnlocked ? (
                        <Play className="w-10 h-10 text-white fill-white ml-1 drop-shadow-sm" />
                      ) : (
                        <Lock className="w-8 h-8 text-slate-400" />
                      )}

                      {/* Completed checkmark badge */}
                      {nivel.isCompleted && (
                        <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-emerald-500 rounded-full flex items-center justify-center border-3 border-white shadow-md">
                          <CheckCircle2 className="w-4 h-4 text-white" />
                        </div>
                      )}

                      {/* Level number badge */}
                      <div className={`absolute -top-2 -left-2 w-8 h-8 rounded-full flex items-center justify-center text-xs font-black shadow-md
                        ${nivel.isCompleted ? 'bg-amber-600 text-white' : nivel.isUnlocked ? 'bg-white text-slate-800' : 'bg-slate-300 text-slate-500'}`}>
                        {index + 1}
                      </div>
                    </div>
                  </button>
                </div>

                {/* ── Info Card ── */}
                <div className="flex-1">
                  <div className={`
                    rounded-2xl p-5 transition-all duration-300 max-w-[320px]
                    ${nivel.isCompleted 
                      ? 'bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200/60 shadow-sm' 
                      : nivel.isUnlocked 
                        ? 'bg-white border-2 border-indigo-200 shadow-lg shadow-indigo-100/50 hover:shadow-xl hover:-translate-y-0.5 cursor-pointer' 
                        : 'bg-slate-50 border-2 border-slate-100 opacity-60'
                    }
                    ${isLeft ? '' : 'ml-auto'}
                  `}
                    onClick={() => nivel.isUnlocked || nivel.isCompleted ? openQuiz(nivel) : null}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className={`font-bold text-lg leading-tight ${nivel.isCompleted ? 'text-amber-800' : nivel.isUnlocked ? 'text-slate-800' : 'text-slate-400'}`}>
                        {nivel.titulo}
                      </h3>
                      {nivel.isCompleted && (
                        <span className="bg-amber-200/70 text-amber-800 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider whitespace-nowrap ml-2 shrink-0">
                          ✓ Hecho
                        </span>
                      )}
                    </div>
                    
                    <p className={`text-sm mb-3 leading-relaxed ${nivel.isCompleted ? 'text-amber-700/70' : nivel.isUnlocked ? 'text-slate-500' : 'text-slate-300'}`}>
                      {nivel.descripcion}
                    </p>

                    <div className="flex items-center gap-3">
                      <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-lg
                        ${nivel.isCompleted ? 'bg-amber-200/50 text-amber-700' : nivel.isUnlocked ? color.light : 'bg-slate-100 text-slate-400'}`}>
                        <Zap className="w-3 h-3" /> +{nivel.xpRecompensa} XP
                      </span>
                      {nivel.isUnlocked && !nivel.isCompleted && (
                        <span className="text-xs text-indigo-600 font-bold flex items-center gap-1 animate-pulse">
                          <Sparkles className="w-3 h-3" /> ¡Disponible!
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* End of Path Trophy */}
        {totalNiveles > 0 && (
          <div className="flex justify-center">
            <div className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-500
              ${completados === totalNiveles 
                ? 'bg-gradient-to-br from-amber-400 to-yellow-500 shadow-2xl shadow-amber-400/50 animate-bounce' 
                : 'bg-slate-100 border-4 border-dashed border-slate-200'}`}>
              <Trophy className={`w-12 h-12 ${completados === totalNiveles ? 'text-white fill-white' : 'text-slate-300'}`} />
            </div>
          </div>
        )}
      </div>

      {/* ═══════════ QUIZ MODAL ═══════════ */}
      {activeNivel && (
        <div className="fixed inset-0 bg-slate-950/90 z-50 flex items-center justify-center backdrop-blur-md p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] shadow-2xl shadow-black/30" style={{ animation: 'modalIn 0.3s ease-out' }}>
            
            {/* Quiz Header */}
            <div className="p-6 bg-gradient-to-r from-slate-800 to-slate-900 flex items-center justify-between">
              <div>
                <h2 className="font-bold text-white text-lg flex items-center gap-2">
                  <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                  {activeNivel.titulo}
                </h2>
                {quizStatus !== 'finished' && preguntas.length > 0 && (
                  <div className="flex items-center gap-1.5 mt-2">
                    {preguntas.map((_: any, i: number) => {
                      let dotColor = 'bg-slate-600';
                      if (i < answers.length) {
                        dotColor = answers[i] ? 'bg-emerald-400' : 'bg-red-400';
                      } else if (i === preguntaIndex) {
                        dotColor = 'bg-amber-400';
                      }
                      return <div key={i} className={`h-2 w-2 rounded-full transition-all duration-300 ${dotColor}`} />;
                    })}
                  </div>
                )}
              </div>
              <button onClick={closeQuiz} className="text-slate-400 hover:text-white transition-colors p-1">
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            {/* Quiz Content */}
            <div className="flex-1 overflow-y-auto p-6 lg:p-10">
              {quizStatus === 'finished' ? (() => {
                const correctas = answers.filter(a => a).length;
                const incorrectas = answers.filter(a => !a).length;
                const total = answers.length;
                const porcentaje = total > 0 ? Math.round((correctas / total) * 100) : 0;
                const esPerfecto = porcentaje === 100;
                const esBueno = porcentaje >= 70;

                return (
                  <div className="py-4">
                    {/* Trophy / Result Icon */}
                    <div className="text-center mb-8">
                      <div className="relative inline-block mb-4">
                        <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto shadow-xl ${
                          esPerfecto ? 'bg-gradient-to-br from-amber-400 to-orange-500 shadow-amber-400/40'
                          : esBueno ? 'bg-gradient-to-br from-emerald-400 to-teal-500 shadow-emerald-400/40'
                          : 'bg-gradient-to-br from-orange-400 to-red-500 shadow-orange-400/40'
                        }`}>
                          {esPerfecto ? <Trophy className="w-12 h-12 text-white fill-white" />
                          : esBueno ? <ShieldCheck className="w-12 h-12 text-white" />
                          : <Target className="w-12 h-12 text-white" />}
                        </div>
                      </div>
                      <h2 className="text-2xl font-black text-slate-800 mb-1">
                        {esPerfecto ? '¡Perfecto! 🏆' : esBueno ? '¡Nivel Completado!' : '¡Nivel Completado!'}
                      </h2>
                      <p className="text-sm text-slate-500 font-medium">
                        {esPerfecto ? 'No cometiste ni un error. ¡Impresionante!'
                        : esBueno ? 'Buen trabajo, sigue así.'
                        : 'Repasa los temas que fallaste para reforzar.'}
                      </p>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-3 gap-3 mb-6">
                      <div className="bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-4 text-center">
                        <div className="text-3xl font-black text-emerald-600">{correctas}</div>
                        <div className="text-xs font-bold text-emerald-500 mt-1 flex items-center justify-center gap-1"><CheckCircle2 className="w-3 h-3"/> Correctas</div>
                      </div>
                      <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4 text-center">
                        <div className="text-3xl font-black text-red-600">{incorrectas}</div>
                        <div className="text-xs font-bold text-red-500 mt-1 flex items-center justify-center gap-1"><XCircle className="w-3 h-3"/> Incorrectas</div>
                      </div>
                      <div className="bg-indigo-50 border-2 border-indigo-200 rounded-2xl p-4 text-center">
                        <div className="text-3xl font-black text-indigo-600">{porcentaje}%</div>
                        <div className="text-xs font-bold text-indigo-500 mt-1">Precisión</div>
                      </div>
                    </div>

                    {/* Progress dots recap */}
                    <div className="bg-slate-50 rounded-2xl p-4 mb-6">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Detalle por pregunta</p>
                      <div className="flex flex-wrap gap-2">
                        {answers.map((isCorrect, i) => (
                          <div key={i} className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black transition-all ${
                            isCorrect 
                              ? 'bg-emerald-100 text-emerald-700 border-2 border-emerald-300' 
                              : 'bg-red-100 text-red-700 border-2 border-red-300'
                          }`}>
                            {isCorrect ? '✓' : '✗'}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* XP Earned */}
                    {earnedXP > 0 && (
                      <div className="text-center">
                        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-100 to-orange-100 border-2 border-amber-300 px-6 py-3 rounded-2xl">
                          <Zap className="w-6 h-6 text-amber-600" />
                          <span className="text-3xl font-black bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">+{earnedXP} XP</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()
            : (
                <>
                  <div className="flex items-center gap-2 mb-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    <span className="bg-slate-100 px-2 py-1 rounded-md">Pregunta {preguntaIndex + 1} de {preguntas.length}</span>
                  </div>
                  <h3 className="text-2xl font-bold text-slate-800 mb-8 leading-relaxed">
                    {preguntas[preguntaIndex]?.texto}
                  </h3>
                  
                  <div className="space-y-3">
                    {preguntas[preguntaIndex]?.opciones.map((opcion: string, idx: number) => {
                      const isSelected = selectedOption === idx;
                      const letters = ['A', 'B', 'C', 'D'];
                      
                      let btnClass = 'border-2 border-slate-200 bg-white text-slate-700 hover:border-indigo-300 hover:bg-indigo-50/30 hover:shadow-sm';
                      let letterClass = 'bg-slate-100 text-slate-500 border-slate-200';
                      
                      if (isSelected && quizStatus === 'idle') {
                        btnClass = 'border-2 border-indigo-500 bg-indigo-50/50 text-indigo-800 shadow-md shadow-indigo-100';
                        letterClass = 'bg-indigo-600 text-white border-indigo-600';
                      }

                      if (quizStatus !== 'idle') {
                        if (idx === preguntas[preguntaIndex].respuestaCorrecta) {
                          btnClass = 'border-2 border-emerald-400 bg-emerald-50 text-emerald-800 shadow-md shadow-emerald-100';
                          letterClass = 'bg-emerald-500 text-white border-emerald-500';
                        } else if (isSelected && idx !== preguntas[preguntaIndex].respuestaCorrecta) {
                          btnClass = 'border-2 border-red-400 bg-red-50 text-red-800 shadow-md shadow-red-100';
                          letterClass = 'bg-red-500 text-white border-red-500';
                        } else {
                          btnClass += ' opacity-40 cursor-not-allowed';
                        }
                      }

                      return (
                        <button
                          key={idx}
                          disabled={quizStatus !== 'idle'}
                          onClick={() => setSelectedOption(idx)}
                          className={`w-full text-left p-4 rounded-2xl font-semibold text-base transition-all duration-200 flex items-center gap-4 ${btnClass}`}
                        >
                          <span className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black border-2 shrink-0 transition-all ${letterClass}`}>
                            {letters[idx]}
                          </span>
                          <span>{opcion}</span>
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>

            {/* Quiz Footer */}
            <div className={`p-6 border-t-2 transition-colors duration-300 ${
              quizStatus === 'correct' ? 'bg-emerald-50 border-emerald-200' 
              : quizStatus === 'incorrect' ? 'bg-red-50 border-red-200' 
              : 'bg-slate-50 border-slate-100'}`}>
              
              {quizStatus === 'idle' && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-400 font-medium">Selecciona una respuesta</span>
                  <button 
                    disabled={selectedOption === null}
                    onClick={handleComprobar}
                    className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 disabled:from-slate-300 disabled:to-slate-300 disabled:text-slate-500 text-white font-bold rounded-xl transition-all shadow-md shadow-indigo-200 disabled:shadow-none text-lg active:scale-95"
                  >
                    Comprobar
                  </button>
                </div>
              )}

              {quizStatus === 'correct' && (
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h4 className="text-emerald-800 font-black text-xl flex items-center gap-2 mb-1">
                      <CheckCircle2 className="w-6 h-6" /> ¡Correcto!
                    </h4>
                    <p className="text-emerald-700 font-medium text-sm">{preguntas[preguntaIndex]?.explicacion}</p>
                  </div>
                  <button onClick={handleContinuar} className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md shadow-emerald-200 text-lg shrink-0 active:scale-95 transition-all">
                    Continuar
                  </button>
                </div>
              )}

              {quizStatus === 'incorrect' && (
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h4 className="text-red-800 font-black text-xl flex items-center gap-2 mb-1">
                      <XCircle className="w-6 h-6" /> Incorrecto
                    </h4>
                    <p className="text-red-700 font-medium text-sm">{preguntas[preguntaIndex]?.explicacion}</p>
                  </div>
                  <button onClick={handleContinuar} className="px-8 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-md shadow-red-200 text-lg shrink-0 active:scale-95 transition-all">
                    Entendido
                  </button>
                </div>
              )}

              {quizStatus === 'finished' && (
                <div className="flex justify-center">
                  <button onClick={closeQuiz} className="px-10 py-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-black rounded-xl shadow-lg shadow-amber-200 hover:shadow-xl hover:-translate-y-0.5 transition-all text-xl active:scale-95">
                    Continuar mi camino
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* CSS Animation */}
      <style>{`
        @keyframes modalIn {
          from { transform: scale(0.9) translateY(20px); opacity: 0; }
          to { transform: scale(1) translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
