import { useState, useEffect, useRef } from "react";
import { getTips } from "../../../api/tips";
import type { Tip } from "../../../types/tip";
import Tips from "./Tips";

interface TipsModalProps {
  isOpen: boolean;
  onClose: () => void;
  id: number | null;
}

export default function TipsModal({ isOpen, onClose, id }: TipsModalProps) {
  const [tips, setTips] = useState<Tip[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const modalRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (isOpen) {
      modalRef.current?.showModal();
      fetchTips(0);
    } else {
      modalRef.current?.close();
    }
  }, [isOpen]);

  const fetchTips = async (pageNum: number) => {
    if (id === null) return;

    const { tips } = await getTips({creator_profile_id: id, limit: 15, offset: pageNum * 8})
    
    if (tips.length < 15) setHasMore(false);

    if (pageNum === 0) {
      setTips(tips);
    } else {
      setTips(prev => [...prev, ...tips]);
    }
  };

  return (
    <dialog ref={modalRef} className="modal" onClose={onClose}>
        <div className="modal-box max-w-xl px-10 py-8 relative">
        <button
            className="absolute top-4 right-6 text-gray-700 cursor-pointer hover:text-red-300 text-3xl font-light"
            onClick={onClose}
        >
            ×
        </button>

        <h3 className="font-bold text-xl mb-4">Recent tips</h3>

        <div className="space-y-3 max-h-[80vh] overflow-y-auto">
            <Tips tips={tips} />
        </div>

        {hasMore && (
            <button
            className="btn btn-md btn-outline btn-neutral hover:text-white rounded-full w-full mt-4"
            onClick={() => {
                const nextPage = page + 1;
                setPage(nextPage);
                fetchTips(nextPage);
            }}
            >
            Load more
            </button>
        )}
        </div>
    </dialog>
    );
}