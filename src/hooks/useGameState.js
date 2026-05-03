import useSWR from 'swr';
import { useTabuGame } from '@/hooks/useTabuGame';
import { useTwentyQGame } from '@/hooks/useTwentyQGame';

const GAME_STATE_ENDPOINT = (id, chatId) => `/api/lessons/${id}/game-state?chat_id=${chatId}`;
const fetcher = (url) => fetch(url).then(res => res.json());

export function useGameState({ lessonId, lessonData, chatId, messages, isLoading }) {

    const { data: gameState } = useSWR(
        lessonId && lessonData && chatId
            ? GAME_STATE_ENDPOINT(lessonId, chatId)
            : null,
        fetcher
    );

    const tabu = useTabuGame(gameState?.game_type === 'tabu' ? gameState : null);
    const twentyQ = useTwentyQGame(gameState?.game_type === 'twenty_questions' ? gameState : null);

    const userTurns = messages.filter(m => m.role === 'user').length;
    const minTurns = lessonData?.min_turns ?? null;
    const turnsRemaining = minTurns !== null ? Math.max(0, minTurns - userTurns) : null;

    const canEndLesson = lessonId
        ? (tabu.guessed || twentyQ.result !== null || (minTurns !== null && userTurns >= minTurns && !isLoading))
        : true;

    return { gameState, tabu, twentyQ, userTurns, turnsRemaining, canEndLesson };
}