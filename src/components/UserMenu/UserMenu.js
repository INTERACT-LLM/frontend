// has user avatar and modal for editing user preferences: is what sits in header
"use client";
import UserAvatar from "@/components/UserAvatar/UserAvatar";
import UserModal from "@/components/UserModal/UserModal";
import { useUser } from "@/context/UserContext";

export default function UserMenu() {
  const { user, showModal, openModal, modalProps } = useUser();
  return (
    <>
      <UserAvatar user={user} onEditRequest={openModal} />
      {showModal && <UserModal {...modalProps} />}
    </>
  );
}