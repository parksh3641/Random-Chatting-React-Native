import { database, auth } from './firebase'; // firebase.ts 초기화 파일
import { ref, set, remove, onValue, get } from 'firebase/database';

// 현재 로그인한 사용자 ID 가져오기
export const getCurrentUserId = (): string | null => {
  return auth.currentUser?.uid || null; // 로그인된 사용자의 UID 반환
};

// 대기열에 사용자 추가
export const joinQueue = async (): Promise<string> => {
  const userId = getCurrentUserId();
  if (!userId) {
    throw new Error('User is not logged in');
  }

  try {
    const queueRef = ref(database, `queue/${userId}`); // UID를 키로 설정

    // 이미 대기열에 있는지 확인
    const snapshot = await get(queueRef);
    if (snapshot.exists()) {
      console.log(`User ${userId} is already in the queue`);
      return userId; // 이미 존재하면 기존 UID 반환
    }

    // 대기열에 사용자 추가
    await set(queueRef, {
      userId,
      createdAt: new Date().toISOString(),
    });

    console.log(`User ${userId} added to the queue`);
    return userId;
  } catch (error) {
    console.error('Error adding user to queue:', error);
    throw error;
  }
};

// 대기열에서 사용자 제거
export const leaveQueue = async (): Promise<void> => {
  const userId = getCurrentUserId();
  if (!userId) {
    throw new Error('User ID is required to leave the queue');
  }

  try {
    const queueEntryRef = ref(database, `queue/${userId}`);
    await remove(queueEntryRef);
    console.log(`User ${userId} removed from the queue`);
  } catch (error) {
    console.error('Error removing user from queue:', error);
    throw error;
  }
};


// 대기열 데이터 수신 및 매칭 처리
export const listenForQueueChanges = (
  userId: string,
  onMatchFound: (matchedUserId: string) => void
) => {
  const queueRef = ref(database, 'queue');

  // 대기열 데이터 변경 수신
  onValue(queueRef, async (snapshot) => {
    const data = snapshot.val();
    if (data) {
      // 대기열에서 매칭 가능한 사용자 검색 (내 ID 제외)
      const userIds = Object.keys(data);
      const matchedUserId = userIds.find((id) => id !== userId); // 자신이 아닌 다른 사용자 검색

      if (matchedUserId) {
        console.log(`Match found: ${userId} matched with ${matchedUserId}`);

        // 매칭된 사용자 삭제
        await leaveQueue(); // 본인 삭제
        await remove(ref(database, `queue/${matchedUserId}`)); // 상대방 삭제

        // 매칭 결과 전달
        onMatchFound(matchedUserId);
      }
    }
  });
};
