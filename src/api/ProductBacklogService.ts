import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

const ProductBacklogService = {
    /**
     * Save Excel file data to the database
     * 
     * @param file The Excel file to save to database
     * @returns The server response containing the saved test cases
     */
    saveToDatabase: async (file: File) => {
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await axios.post(`${API_URL}/product-backlog/save`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error saving product backlog to database:', error);
            throw error;
        }
    },

    /**
     * Get list of physical Excel files from server storage
     * 
     * @returns The server response containing list of physical files
     */
    getPhysicalFiles: async () => {
        try {
            const response = await axios.get(`${API_URL}/product-backlog/physical-files`);
            return response.data;
        } catch (error) {
            console.error('Error fetching physical files:', error);
            throw error;
        }
    },

    /**
     * Delete physical Excel file from server (includes database cleanup)
     * 
     * @param fileName The name of the file to delete from server
     * @returns The server response containing deletion result
     */
    deletePhysicalFile: async (fileName: string) => {
        try {
            const response = await axios.delete(`${API_URL}/product-backlog/delete-file/${encodeURIComponent(fileName)}`);
            return response.data;
        } catch (error) {
            console.error(`Error deleting physical file '${fileName}':`, error);
            throw error;
        }
    }
};

export default ProductBacklogService;
