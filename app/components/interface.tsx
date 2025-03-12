
// This file contains the interfaces aligned with database formatting for hike, group,
// and review objects. 

// Declared Hike Interface
    export interface Hike {
        created_at: string,
        creator_id: string,
        description: string,
        difficulty: string,
        distance: string,
        duration: string,
        end_lat: number,
        end_lng: number,
        rating: string,
        routing_points: Array<Array<number>>,
        start_lat: number,
        start_lng: number,
        tags: string,
        trail_id: string,
        trail_image: string,
        trail_name: string,
    };

// Declared Group Interface
    export interface Group {
        created_at: string,
        created_by: string,     
        group_description: string,
        group_host: string,
        group_id: string,       
        group_name: string,
        start_time: string,
        total_users_joined: number;
        trail_id: string,
        trail_name: string,
        users_joined: Array<number>,   
    };


// Declared Review Interface
    export interface Review {
        rating: number,
        review_date: string,
        review_id: number,
        review_text: string,
        trail_id: number,
        username: string,
    };


