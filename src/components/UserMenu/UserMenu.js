// has user avatar and modal for editing user preferences:
"use client";
import { useParams } from "next/navigation"; // get lessonId from url to disable editing during lesson
import UserAvatar from "@/components/UserAvatar/UserAvatar";
import UserModal from "@/components/UserModal/UserModal";
import { useUser } from "@/context/UserContext";

export default function UserMenu() {
  const { user, showModal, openModal, modalProps } = useUser();
  const params = useParams();
  const inLesson = !!params?.lessonId; // adjust key to match your route segment

  return (
    <>
      <UserAvatar user={user} onEditRequest={openModal} disabled={inLesson} />
      {showModal && <UserModal {...modalProps} />}
    </>
  );
}