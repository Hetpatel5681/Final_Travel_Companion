import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../../components/Card';
import { Recommendation } from '../api/recommendation.api';
import { recordInteraction, InteractionType } from '../api/interaction.api';
import { Heart, ThumbsDown, Bookmark } from 'lucide-react';

interface Props {
  recommendation: Recommendation;
  onInteractionSuccess?: (type: InteractionType) => void;
  isLiked?: boolean;
  isDisliked?: boolean;
  isSaved?: boolean;
}

export function RecommendationCard({ recommendation, onInteractionSuccess, isLiked, isDisliked, isSaved }: Props) {
  const navigate = useNavigate();
  const matchPercentage = Math.round(recommendation.similarityScore * 100);
  
  const [localLike, setLocalLike] = useState(!!isLiked);
  const [localDislike, setLocalDislike] = useState(!!isDisliked);
  const [localSave, setLocalSave] = useState(!!isSaved);
  
  const [pendingAction, setPendingAction] = useState<InteractionType | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [viewTracked, setViewTracked] = useState(false);

  const handleAction = async (e: React.MouseEvent, type: InteractionType) => {
    e.stopPropagation();
    if (pendingAction) return; 
    
    setPendingAction(type);
    setErrorMsg(null);
    
    const prevLike = localLike;
    const prevDislike = localDislike;
    const prevSave = localSave;
    
    let apiActionType = type;

    if (type === 'LIKE') {
      setLocalLike(!localLike);
      if (!localLike) setLocalDislike(false);
    } else if (type === 'DISLIKE') {
      setLocalDislike(!localDislike);
      if (!localDislike) setLocalLike(false);
    } else if (type === 'SAVE') {
      if (localSave) {
        apiActionType = 'UNSAVE';
      }
      setLocalSave(!localSave);
    }
    
    try {
      await recordInteraction(recommendation.destinationId, apiActionType);
      if (['LIKE', 'SAVE', 'UNSAVE', 'DISLIKE', 'BOOK'].includes(apiActionType) && onInteractionSuccess) {
        onInteractionSuccess(apiActionType);
      }
    } catch (err) {
      setLocalLike(prevLike);
      setLocalDislike(prevDislike);
      setLocalSave(prevSave);
      setErrorMsg("Couldn't save this action. Please try again.");
      setTimeout(() => setErrorMsg(null), 3000);
    } finally {
      setPendingAction(null);
    }
  };

  const handleCardClick = useCallback(async () => {
    if (!viewTracked) {
      setViewTracked(true);
      try {
         await recordInteraction(recommendation.destinationId, 'VIEW');
      } catch (err) {
         console.error('View tracking failed', err);
      }
    }
  }, [recommendation.destinationId, viewTracked]);

  useEffect(() => {
    setLocalLike(!!isLiked);
    setLocalDislike(!!isDisliked);
    setLocalSave(!!isSaved);
  }, [isLiked, isDisliked, isSaved]);

  return (
    <Card hover className="h-[480px] flex flex-col p-0 overflow-hidden cursor-pointer group border-none relative transform-gpu hover:shadow-2xl hover:shadow-indigo-500/20">
      <div className="absolute inset-0 w-full h-full" onClick={handleCardClick} title="View details">
        {/* Placeholder image that gets beautiful with CSS fallback if recommendation doesn't have an image */}
        <div className="absolute inset-0 bg-slate-200 dark:bg-slate-800 animate-pulse" />
        <img 
          src={`https://images.unsplash.com/photo-1504280387537-88d44ec74a9b?q=80&w=800&auto=format&fit=crop`} 
          alt={recommendation.name}
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]"
          // If recommendation.imageUrl exists, we can use it, but keeping a fallback
          onError={(e) => { e.currentTarget.style.display = 'none'; }}
        />
        
        {/* Gradients for text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/90 group-hover:to-black/95 transition-all duration-500" />
        
        {/* Badges / Header overlay */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-10">
           <div className="flex flex-col gap-2">
             <span className="bg-white/20 backdrop-blur-md text-white border border-white/30 text-xs font-black uppercase tracking-widest px-3 py-1.5 rounded-full shadow-lg">
               {recommendation.destinationType[0] || 'DESTINATION'}
             </span>
             <span className="bg-emerald-500/80 backdrop-blur-md text-white border border-emerald-400/50 text-[10px] font-black px-2.5 py-1 rounded-full whitespace-nowrap shadow-sm self-start">
               {matchPercentage}% Match
             </span>
           </div>
           
           <button 
             onClick={(e) => handleAction(e, 'SAVE')}
             className={`p-2.5 rounded-full backdrop-blur-md transition-all shadow-xl hover:scale-110 active:scale-95
               ${localSave ? 'bg-white text-indigo-600' : 'bg-black/30 text-white border border-white/20 hover:bg-black/50'}
               ${pendingAction === 'SAVE' ? 'opacity-50 cursor-not-allowed' : ''}
             `}
             title="Save for later"
             disabled={pendingAction === 'SAVE'}
           >
             <Bookmark size={18} className={localSave ? 'fill-current' : ''} strokeWidth={2.5} />
           </button>
        </div>
        
        {/* Content overlay at bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-6 z-10 flex flex-col justify-end min-h-[50%]">
          <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 ease-out">
            <h3 className="text-3xl font-black text-white leading-tight drop-shadow-md mb-1">{recommendation.name}</h3>
            <p className="text-sm text-slate-200 font-medium tracking-wide mb-3 drop-shadow">
              {[recommendation.state, recommendation.country].filter(Boolean).join(', ')}
            </p>
            
            <p className="text-sm text-slate-300 font-medium line-clamp-2 mb-4 group-hover:line-clamp-3 transition-all duration-500 ease-in-out h-10 group-hover:h-16 overflow-hidden">
              {recommendation.description}
            </p>

            <div className="flex items-center justify-between mt-2 pt-4 border-t border-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
               <div className="flex gap-2">
                 <button
                    onClick={(e) => handleAction(e, 'LIKE')}
                    disabled={pendingAction === 'LIKE'}
                    className={`flex items-center justify-center p-2 rounded-full transition-all hover:scale-110
                      ${localLike ? 'bg-pink-500 text-white shadow-lg shadow-pink-500/30' : 'bg-white/10 text-white backdrop-blur-md hover:bg-pink-500'}
                    `}
                 >
                   <Heart size={16} className={localLike ? 'fill-current' : ''} strokeWidth={2.5} />
                 </button>
                 <button
                    onClick={(e) => handleAction(e, 'DISLIKE')}
                    disabled={pendingAction === 'DISLIKE'}
                    className={`flex items-center justify-center p-2 rounded-full transition-all hover:scale-110
                      ${localDislike ? 'bg-slate-800 text-white' : 'bg-white/10 text-white backdrop-blur-md hover:bg-slate-800'}
                    `}
                 >
                   <ThumbsDown size={16} className={localDislike ? 'fill-current' : ''} strokeWidth={2.5} />
                 </button>
               </div>
               
               <div className="flex gap-3">
                 <button 
                   onClick={(e) => { e.stopPropagation(); handleCardClick(); navigate('/destination-explorer'); }}
                   className="text-xs font-bold text-white hover:text-indigo-200 uppercase tracking-widest transition-colors flex items-center"
                 >
                   Explore
                 </button>
                 <button 
                   onClick={(e) => { e.stopPropagation(); navigate(`/trip-planner?destinationId=${recommendation.destinationId}&destination=${encodeURIComponent(recommendation.name)}`); }}
                   className="text-xs font-black bg-white text-indigo-900 hover:bg-indigo-50 px-4 py-2 rounded-full shadow-lg hover:shadow-white/20 transition-all uppercase tracking-widest"
                 >
                   Plan Trip
                 </button>
               </div>
            </div>
          </div>
        </div>
        
        {errorMsg && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20 text-xs text-white bg-red-500/90 py-2 px-4 rounded-full font-bold shadow-2xl backdrop-blur-xl">
            {errorMsg}
          </div>
        )}
      </div>
    </Card>
  );
}
