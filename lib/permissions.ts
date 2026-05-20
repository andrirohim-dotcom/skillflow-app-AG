import { Permission, PermissionContext, PermissionDeniedException } from "./types.multiuser";

export const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  owner: [
    "workspace:manage",
    "workspace:settings",
    "member:invite",
    "member:remove",
    "member:change_role",
    "learning_path:create",
    "learning_path:delete",
    "learning_path:publish",
    "source:create",
    "source:delete",
    "source:publish",
    "progress:view_team",
    "progress:view_personal",
    "progress:approve_level",
    "insight:share",
    "insight:view_team"
  ],
  admin: [
    "workspace:settings",
    "member:invite",
    "member:remove",
    "member:change_role",
    "learning_path:create",
    "learning_path:delete",
    "learning_path:publish",
    "source:create",
    "source:delete",
    "source:publish",
    "progress:view_team",
    "progress:view_personal",
    "progress:approve_level",
    "insight:share",
    "insight:view_team"
  ],
  mentor: [
    "learning_path:create",
    "learning_path:publish",
    "source:create",
    "source:publish",
    "progress:view_team",
    "progress:view_personal",
    "progress:approve_level",
    "insight:share",
    "insight:view_team"
  ],
  member: [
    "source:create",
    "progress:view_personal",
    "insight:share"
  ],
  learner: [
    "progress:view_personal"
  ]
};

export function hasPermission(role: string, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

export function assertPermission(context: PermissionContext, action: Permission, resource: string): void {
  if (!hasPermission(context.membership.role, action)) {
    throw new PermissionDeniedException(context.userId, action, resource);
  }
}
