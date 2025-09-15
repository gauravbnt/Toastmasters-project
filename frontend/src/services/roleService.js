import api from './api'

export const roleService = {
  // Get all roles
  getAllRoles: async () => {
    const response = await api.get('/roles/all')
    return response.data
  },

  // Get role by ID
  getRoleById: async (id) => {
    const response = await api.get(`/roles/${id}`)
    return response.data
  },

  // Create new role with retry logic
  createRole: async (roleData, retryCount = 0) => {
    const maxRetries = 2;
    try {
      // Prepare the request body with only the fields we want to send
      const requestBody = {
        roleName: roleData.roleName?.trim() || '',
        roleDescription: roleData.roleDescription?.trim() || ''
      };
      
      console.log('Sending role data:', requestBody);
      
      const response = await api.post('/roles/add', requestBody, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      console.log('Role creation response:', response.data);
      return response.data;
      
    } catch (error) {
      // If it's a concurrency error and we have retries left, try again
      if (error.response?.status === 400 && 
          error.response?.data?.message?.includes('another transaction') && 
          retryCount < maxRetries) {
        console.log(`Retrying role creation (attempt ${retryCount + 1} of ${maxRetries})`);
        return this.createRole(roleData, retryCount + 1);
      }
      
      // If we've exhausted retries or it's a different error, rethrow
      console.error('Failed to create role:', error);
      throw error;
    }
  },

  // Update role
  updateRole: async (id, roleData) => {
    // Prepare the request body as JSON
    const requestBody = {
      roleName: roleData.roleName || '',
      roleDescription: roleData.roleDescription || ''
    };
    
    console.log('Updating role with data:', requestBody);
    
    const response = await api.put(`/roles/${id}`, requestBody, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Role update response:', response.data);
    return response.data;
  },

  // Delete role
  deleteRole: async (id) => {
    const response = await api.delete(`/roles/${id}`)
    return response.data
  },
  
  // Get count of all roles
  getRoleCount: async () => {
    const response = await api.get('/roles/count')
    return response.data
  },
  
  // Get the next available role ID (starting from 001)
  getNextRoleId: async () => {
    const response = await api.get('/roles/next-id')
    return response.data
  }
}
