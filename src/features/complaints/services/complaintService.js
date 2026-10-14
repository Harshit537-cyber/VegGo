import apiClient from "../../../api/axiosInstance";
import { COMPLAINT_ENDPOINTS } from "../../../constants/endpoints.constants";

// GET /api/admin/complaints/stats
export const getComplaintStats = async () => {
  const response = await apiClient.get(COMPLAINT_ENDPOINTS.STATS);
  return response.data;
};

// GET /api/admin/complaints?page=0&size=20&status=&role=&search=
export const getComplaints = async ({
  status = "ALL",
  role = "ALL",
  search = "",
  page = 0,
  size = 20,
} = {}) => {
  const params = { page, size };

  if (status && status.toUpperCase() !== "ALL") {
    params.status = status.toUpperCase();
  }

  if (role && role.toUpperCase() !== "ALL") {
    params.role = role.toUpperCase();
  }

  if (search && search.trim()) {
    params.search = search.trim();
  }

  const response = await apiClient.get(COMPLAINT_ENDPOINTS.BASE, { params });
  return response.data;
};

// GET /api/admin/complaints/{complaintId}
export const getComplaintById = async (complaintId) => {
  const response = await apiClient.get(COMPLAINT_ENDPOINTS.DETAILS(complaintId));
  return response.data;
};

// PUT /api/admin/complaints/{complaintId}/status  -> { status, adminNotes }
export const updateComplaintStatus = async (complaintId, status, adminNotes) => {
  const payload = {
    status,
    adminNotes,
    resolutionNotes: adminNotes,
    notes: adminNotes,
  };
  const response = await apiClient.put(
    COMPLAINT_ENDPOINTS.UPDATE_STATUS(complaintId),
    payload
  );
  return response.data;
};
