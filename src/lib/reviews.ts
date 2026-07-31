export type Review = {
  id: string;
  nickname: string;
  content: string;
  rating: number;
  created_at: string;
};

export type ReviewInput = {
  nickname: string;
  content: string;
  rating: number;
  deletePassword: string;
};

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isReviewBoardConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

function getHeaders() {
  if (!SUPABASE_ANON_KEY) throw new Error("후기 게시판 연결값이 필요합니다.");

  return {
    apikey: SUPABASE_ANON_KEY,
    Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    "Content-Type": "application/json",
  };
}

function getEndpoint(path: string) {
  if (!SUPABASE_URL) throw new Error("후기 게시판 연결값이 필요합니다.");
  return `${SUPABASE_URL.replace(/\/$/, "")}${path}`;
}

export async function fetchReviews(): Promise<Review[]> {
  const response = await fetch(getEndpoint("/rest/v1/dalmuti_reviews?select=id,nickname,content,rating,created_at&order=created_at.desc&limit=50"), {
    headers: getHeaders(),
  });

  if (!response.ok) throw new Error("후기를 불러오지 못했습니다.");
  return response.json() as Promise<Review[]>;
}

export async function createReview(input: ReviewInput) {
  const response = await fetch(getEndpoint("/rest/v1/dalmuti_reviews"), {
    method: "POST",
    headers: {
      ...getHeaders(),
      Prefer: "return=minimal",
    },
    body: JSON.stringify({
      nickname: input.nickname.trim(),
      content: input.content.trim(),
      rating: input.rating,
      delete_password: input.deletePassword,
    }),
  });

  if (!response.ok) throw new Error("후기를 저장하지 못했습니다.");
}

export async function deleteReview(reviewId: string, deletePassword: string) {
  const response = await fetch(getEndpoint("/rest/v1/rpc/delete_dalmuti_review"), {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({
      review_id: reviewId,
      review_password: deletePassword,
    }),
  });

  if (!response.ok) throw new Error("후기를 삭제하지 못했습니다.");
  const deleted = (await response.json()) as boolean;
  if (!deleted) throw new Error("삭제 비밀번호가 맞지 않습니다.");
}
