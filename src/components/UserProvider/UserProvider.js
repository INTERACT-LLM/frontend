"use client";
import UserAvatar from "@/components/UserAvatar/UserAvatar";
import UserModal from "@/components/UserModal/UserModal";
import useUser from "@/hooks/UseUser";

export default function UserProvider() {
  const { user, showModal, openModal, modalProps } = useUser();
  return (
    <>
      <UserAvatar user={user} onEditRequest={openModal} />
      {showModal && <UserModal {...modalProps} />}
    </>
  );
}