import { useContext } from 'react';
import { CommentContext } from '../components/CustomComponents/CommentContext';

function useComment() {
    const context = useContext(CommentContext);

    if (!context) {
        throw new Error('useComment must be used within an CommentProvider');
    }

    return context;
}

export default useComment;
