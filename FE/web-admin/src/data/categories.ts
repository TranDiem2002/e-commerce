export interface Category {
    id: number;
    name: string;
    count: number;
    path: string;
    subCategories?: Category[];
  }
  
  export const productCategories: Category[] = [
    { 
      id: 1, 
      name: 'Sale', 
      count: 42, 
      path: '/sale' 
    },
    { 
      id: 2, 
      name: 'Combo chăm sóc da', 
      count: 18, 
      path: '/combo-cham-soc-da' 
    },
    // Thêm các danh mục khác từ ví dụ trước
    { 
      id: 7, 
      name: 'Trang điểm', 
      count: 15, 
      path: '/trang-diem',
      subCategories: [
        { id: 71, name: 'Son dưỡng môi', count: 0, path: '/son-duong-moi' },
        { id: 72, name: 'Son màu không chì', count: 0, path: '/son-mau-khong-chi' },
        { id: 73, name: 'Tẩy da chết môi', count: 0, path: '/tay-da-chet-moi' },
        { id: 74, name: 'Kem nén', count: 9, path: '/kem-nen' },
        { id: 75, name: 'Kem má', count: 6, path: '/kem-ma' },
      ]
    },
    // Các danh mục khác
  ];