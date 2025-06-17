export type UserRolesObjT = {
  role: UserRoleT;
};

export type UserRoleT = {
  id: string;
  name: string;
};

export type ProfileImageT = {
  id: string;
  url: string | null;
  fileName: string | null;
  fileType: string | null;
  fileSize: number | null;
  createdAt: string;
};

export type ExtendedUserT = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  createdAt: string;
  updatedAt: string | null;
  termsPrivacy: boolean | null;
  termsAgb: boolean | null;
  roles: UserRoleT[];
  profileImage: ProfileImageT | null;
};
