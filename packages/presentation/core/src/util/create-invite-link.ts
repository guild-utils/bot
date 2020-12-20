import { ClientApplication, Permissions } from "discord.js";

export function createInviteLink(
  application: ClientApplication,
  permissions: Permissions
): string {
  return `https://discord.com/oauth2/authorize?client_id=${application.id}&permissions=${permissions.bitfield}&scope=bot+applications.commands`;
}
