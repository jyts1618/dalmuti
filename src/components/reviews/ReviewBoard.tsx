"use client";

import { useEffect, useState, type FormEvent } from "react";

import { createReview, deleteReview, fetchReviews, isReviewBoardConfigured, type Review } from "@/lib/reviews";

const RATING_OPTIONS = [5, 4, 3, 2, 1];

type ReviewBoardProps = {
  onClose: () => void;
  refreshSignal: number;
};

export function ReviewBoard({ onClose, refreshSignal }: ReviewBoardProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [nickname, setNickname] = useState("");
  const [content, setContent] = useState("");
  const [rating, setRating] = useState(5);
  const [deletePassword, setDeletePassword] = useState("");
  const [deletePasswordById, setDeletePasswordById] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isReviewBoardConfigured) return;
    void loadReviews();
  }, [refreshSignal]);

  async function loadReviews(options: { clearMessage?: boolean } = { clearMessage: true }) {
    setIsLoading(true);
    if (options.clearMessage) setMessage("");
    try {
      setReviews(await fetchReviews());
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "후기를 불러오지 못했습니다.");
    } finally {
      setIsLoading(false);
    }
  }

  async function submitReview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!nickname.trim() || !content.trim() || !deletePassword.trim()) {
      setMessage("닉네임, 후기, 삭제 비밀번호를 모두 입력해주세요.");
      return;
    }

    setIsSaving(true);
    setMessage("");
    try {
      await createReview({ nickname, content, rating, deletePassword });
      setNickname("");
      setContent("");
      setRating(5);
      setDeletePassword("");
      setMessage("후기가 등록되었습니다.");
      await loadReviews({ clearMessage: false });
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "후기를 저장하지 못했습니다.");
    } finally {
      setIsSaving(false);
    }
  }

  async function removeReview(reviewId: string) {
    const password = deletePasswordById[reviewId]?.trim();
    if (!password) {
      setMessage("삭제 비밀번호를 입력해주세요.");
      return;
    }

    setMessage("");
    try {
      await deleteReview(reviewId, password);
      setDeletePasswordById((current) => {
        const next = { ...current };
        delete next[reviewId];
        return next;
      });
      setMessage("후기가 삭제되었습니다.");
      await loadReviews({ clearMessage: false });
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "후기를 삭제하지 못했습니다.");
    }
  }

  if (!isReviewBoardConfigured) {
    return (
      <div className="space-y-4">
        <p className="text-[#d9f5ef]">
          친구들이 남긴 후기를 모두에게 보여주려면 Supabase 연결값이 필요합니다. 아래 두 값을 준비해서 알려주면 바로 연결해드릴게요.
        </p>
        <div className="rounded border border-amber-200/30 bg-[#1a1023]/60 p-4 text-sm text-amber-50">
          <p>NEXT_PUBLIC_SUPABASE_URL</p>
          <p>NEXT_PUBLIC_SUPABASE_ANON_KEY</p>
        </div>
        <button type="button" onClick={onClose} className="rounded bg-amber-300 px-4 py-2 font-semibold text-[#1a1023]">
          확인
        </button>
      </div>
    );
  }

  return (
    <div className="grid max-h-[75vh] gap-5 overflow-y-auto pr-1 lg:grid-cols-[320px_minmax(0,1fr)]">
      <form onSubmit={submitReview} className="space-y-3 rounded border border-amber-200/30 bg-white/5 p-4">
        <div>
          <label htmlFor="review-nickname" className="text-sm text-[#fff8e5]">
            닉네임
          </label>
          <input
            id="review-nickname"
            value={nickname}
            onChange={(event) => setNickname(event.target.value)}
            maxLength={16}
            className="mt-2 w-full rounded border border-amber-200/40 bg-[#1a1023] px-3 py-2 text-amber-50 outline-none focus:border-amber-200"
          />
        </div>
        <div>
          <label htmlFor="review-rating" className="text-sm text-[#fff8e5]">
            별점
          </label>
          <select
            id="review-rating"
            value={rating}
            onChange={(event) => setRating(Number(event.target.value))}
            className="mt-2 w-full rounded border border-amber-200/40 bg-[#1a1023] px-3 py-2 text-amber-50 outline-none focus:border-amber-200"
          >
            {RATING_OPTIONS.map((item) => (
              <option key={item} value={item}>
                {item}점
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="review-content" className="text-sm text-[#fff8e5]">
            후기
          </label>
          <textarea
            id="review-content"
            value={content}
            onChange={(event) => setContent(event.target.value)}
            maxLength={500}
            rows={5}
            className="mt-2 w-full resize-none rounded border border-amber-200/40 bg-[#1a1023] px-3 py-2 text-amber-50 outline-none focus:border-amber-200"
          />
        </div>
        <div>
          <label htmlFor="review-delete-password" className="text-sm text-[#fff8e5]">
            삭제 비밀번호
          </label>
          <input
            id="review-delete-password"
            type="password"
            value={deletePassword}
            onChange={(event) => setDeletePassword(event.target.value)}
            maxLength={24}
            className="mt-2 w-full rounded border border-amber-200/40 bg-[#1a1023] px-3 py-2 text-amber-50 outline-none focus:border-amber-200"
          />
        </div>
        <button
          type="submit"
          disabled={isSaving}
          className="w-full rounded bg-amber-300 px-4 py-2 font-semibold text-[#1a1023] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSaving ? "등록 중" : "후기 남기기"}
        </button>
        {message ? <p className="text-sm text-amber-100" role="status">{message}</p> : null}
      </form>

      <section className="min-w-0">
        {isLoading ? <p className="rounded border border-amber-200/30 bg-white/5 p-4 text-[#d9f5ef]">후기를 불러오는 중입니다.</p> : null}
        {!isLoading && reviews.length === 0 ? (
          <p className="rounded border border-amber-200/30 bg-white/5 p-4 text-[#d9f5ef]">아직 등록된 후기가 없습니다.</p>
        ) : null}
        <div className="space-y-3">
          {reviews.map((review) => (
            <article key={review.id} className="rounded border border-amber-200/30 bg-white/5 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-semibold text-amber-100">{review.nickname}</p>
                <p className="text-xs text-[#d9f5ef]">
                  {new Date(review.created_at).toLocaleDateString("ko-KR")} · {"★".repeat(review.rating)}
                </p>
              </div>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-[#fff8e5]">{review.content}</p>
              <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                <input
                  type="password"
                  aria-label={`${review.nickname} 후기 삭제 비밀번호`}
                  placeholder="삭제 비밀번호"
                  value={deletePasswordById[review.id] ?? ""}
                  onChange={(event) => setDeletePasswordById((current) => ({ ...current, [review.id]: event.target.value }))}
                  className="min-w-0 rounded border border-amber-200/30 bg-[#1a1023] px-3 py-2 text-sm text-amber-50 outline-none focus:border-amber-200"
                />
                <button type="button" onClick={() => removeReview(review.id)} className="rounded border border-amber-200/40 px-3 py-2 text-sm text-amber-100">
                  삭제
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
