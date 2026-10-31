import type { CreateMemberPayload, MemberOverview, MemberSummary, UpdateMemberPayload } from "../types/members";
import { apiRequest } from "./apiClient";

export function getMembers(): Promise<MemberSummary[]> {
	return apiRequest<MemberSummary[]>('/members');
}

export function getMemberByID(id: string | undefined): Promise<MemberSummary> {
	return apiRequest<MemberSummary>(`/members/${id}`);
}

export function getMemberOverview(id: string | undefined): Promise<MemberOverview> {
	return apiRequest<MemberOverview>(`/members/${id}/overview`);
}

export function createMember(memberData: CreateMemberPayload): Promise<MemberSummary> {
	return apiRequest<MemberSummary>('/members', { method: "POST", body: JSON.stringify(memberData) });
}

export function updateMemberByID(id: string | undefined, updatedMember: UpdateMemberPayload): Promise<MemberSummary> {
	return apiRequest<MemberSummary>(`/members/${id}`, { method: "PATCH", body: JSON.stringify(updatedMember) });
}

export function deleteMemberByID(id: string | undefined): Promise<unknown> {
	return apiRequest<unknown>(`/members/${id}`, { method: "DELETE" });
}
