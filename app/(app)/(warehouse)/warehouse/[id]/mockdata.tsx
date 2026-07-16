export interface ZoneType {
  id: string;
  code: string;
  name: string;
}

export const MOCK_ZONE_TYPES: ZoneType[] = [
  { id: "1", code: "CHARGING", name: "Khu vực sạc" },
  { id: "2", code: "PARKING", name: "Khu vực đỗ" },
  { id: "3", code: "PICKING", name: "Khu vực lấy hàng" },
  { id: "4", code: "DROPPING", name: "Khu vực bỏ hàng" },
  { id: "5", code: "MOVING", name: "Khu vực đường đi" },
  { id: "6", code: "BYPASS", name: "Khu vực đường tránh" },
  { id: "7", code: "MAINTENANCE", name: "Khu vực bảo trì" },
];

export const MOCK_ZONES = [
  {
    id: "zone_mock_1",
    zone_type_code: "MOVING",
    zone_type_name: "Khu vực đường đi",
    zone_type_id: "5",
    name: "Đường đi 1",
    code: "DD_001",
    description: "",
    nodes: [
      {
        id: "node_mock_1",
        x: 2,
        y: 2,
        code: "1-C1",
        name: "1-C1",
        neighbor_mask: "0000"
      }
    ]
  },
  {
    id: "zone_mock_2",
    zone_type_code: "MOVING",
    zone_type_name: "Khu vực đường đi",
    zone_type_id: "5",
    name: "Đường đi 2",
    code: "DD_002",
    description: "",
    nodes: [
      {
        id: "node_mock_2",
        x: 3,
        y: 2,
        code: "1-C2",
        name: "1-C2",
        neighbor_mask: "0000"
      }
    ]
  },
  {
    id: "zone_mock_3",
    zone_type_code: "MOVING",
    zone_type_name: "Khu vực đường đi",
    zone_type_id: "5",
    name: "Đường đi 3",
    code: "DD_003",
    description: "",
    nodes: [
      {
        id: "node_mock_3",
        x: 4,
        y: 2,
        code: "1-C3",
        name: "1-C3",
        neighbor_mask: "0000"
      }
    ]
  },
  {
    id: "zone_mock_4",
    zone_type_code: "MAINTENANCE",
    zone_type_name: "Khu vực bảo trì",
    zone_type_id: "7",
    name: "Đường đi 4",
    code: "DD_004",
    description: "",
    nodes: [
      {
        id: "node_mock_4",
        x: 5,
        y: 3,
        code: "1-C4",
        name: "1-C4",
        neighbor_mask: "0000"
      }
    ]
  },
  {
    id: "zone_mock_5",
    zone_type_code: "MOVING",
    zone_type_name: "Khu vực đường đi",
    zone_type_id: "5",
    name: "Đường đi 5",
    code: "DD_005",
    description: "",
    nodes: [
      {
        id: "node_mock_5",
        x: 4,
        y: 4,
        code: "1-C5",
        name: "1-C5",
        neighbor_mask: "0000"
      }
    ]
  },
  {
    id: "zone_mock_6",
    zone_type_code: "MOVING",
    zone_type_name: "Khu vực đường đi",
    zone_type_id: "5",
    name: "Đường đi 6",
    code: "DD_006",
    description: "",
    nodes: [
      {
        id: "node_mock_6",
        x: 3,
        y: 4,
        code: "1-C6",
        name: "1-C6",
        neighbor_mask: "0000"
      }
    ]
  },
  {
    id: "zone_mock_7",
    zone_type_code: "MOVING",
    zone_type_name: "Khu vực đường đi",
    zone_type_id: "5",
    name: "Đường đi 7",
    code: "DD_007",
    description: "",
    nodes: [
      {
        id: "node_mock_7",
        x: 2,
        y: 4,
        code: "1-C7",
        name: "1-C7",
        neighbor_mask: "0000"
      }
    ]
  },
  {
    id: "zone_mock_8",
    zone_type_code: "MOVING",
    zone_type_name: "Khu vực đường đi",
    zone_type_id: "5",
    name: "Đường đi 8",
    code: "DD_008",
    description: "",
    nodes: [
      {
        id: "node_mock_8",
        x: 2,
        y: 3,
        code: "1-C8",
        name: "1-C8",
        neighbor_mask: "0000"
      }
    ]
  },
  {
    id: "zone_mock_9",
    zone_type_code: "MOVING",
    zone_type_name: "Khu vực đường đi",
    zone_type_id: "5",
    name: "Đường đi 9",
    code: "DD_009",
    description: "",
    nodes: [
      {
        id: "node_mock_9",
        x: 2,
        y: 5,
        code: "1-C9",
        name: "1-C9",
        neighbor_mask: "0000"
      }
    ]
  },
  {
    id: "zone_mock_10",
    zone_type_code: "MOVING",
    zone_type_name: "Khu vực đường đi",
    zone_type_id: "5",
    name: "Đường đi 10",
    code: "DD_0010",
    description: "",
    nodes: [
      {
        id: "node_mock_10",
        x: 3,
        y: 5,
        code: "1-C10",
        name: "1-C10",
        neighbor_mask: "0000"
      }
    ]
  },
  {
    id: "zone_mock_11",
    zone_type_code: "MOVING",
    zone_type_name: "Khu vực đường đi",
    zone_type_id: "5",
    name: "Đường đi 11",
    code: "DD_0011",
    description: "",
    nodes: [
      {
        id: "node_mock_11",
        x: 2,
        y: 6,
        code: "1-C11",
        name: "1-C11",
        neighbor_mask: "0000"
      }
    ]
  },
  {
    id: "zone_mock_12",
    zone_type_code: "MOVING",
    zone_type_name: "Khu vực đường đi",
    zone_type_id: "5",
    name: "Đường đi 12",
    code: "DD_0012",
    description: "",
    nodes: [
      {
        id: "node_mock_12",
        x: 3,
        y: 6,
        code: "1-C12",
        name: "1-C12",
        neighbor_mask: "0000"
      }
    ]
  },
  {
    id: "zone_mock_13",
    zone_type_code: "MOVING",
    zone_type_name: "Khu vực sạc",
    zone_type_id: "1",
    name: "Đường đi 13",
    code: "DD_0013",
    description: "",
    nodes: [
      {
        id: "node_mock_13",
        x: 2,
        y: 7,
        code: "1-C13",
        name: "1-C13",
        neighbor_mask: "0000"
      }
    ]
  },
  {
    id: "zone_mock_14",
    zone_type_code: "MOVING",
    zone_type_name: "Khu vực đường đi",
    zone_type_id: "5",
    name: "Đường đi 14",
    code: "DD_0014",
    description: "",
    nodes: [
      {
        id: "node_mock_14",
        x: 3,
        y: 7,
        code: "1-C14",
        name: "1-C14",
        neighbor_mask: "0000"
      }
    ]
  },
  {
    id: "zone_mock_15",
    zone_type_code: "MOVING",
    zone_type_name: "Khu vực đường đi",
    zone_type_id: "5",
    name: "Đường đi 15",
    code: "DD_0015",
    description: "",
    nodes: [
      {
        id: "node_mock_15",
        x: 2,
        y: 8,
        code: "1-C15",
        name: "1-C15",
        neighbor_mask: "0000"
      }
    ]
  },
  {
    id: "zone_mock_16",
    zone_type_code: "MOVING",
    zone_type_name: "Khu vực đường đi",
    zone_type_id: "5",
    name: "Đường đi 16",
    code: "DD_0016",
    description: "",
    nodes: [
      {
        id: "node_mock_16",
        x: 3,
        y: 8,
        code: "1-C16",
        name: "1-C16",
        neighbor_mask: "0000"
      }
    ]
  },
  {
    id: "zone_mock_17",
    zone_type_code: "MOVING",
    zone_type_name: "Khu vực đường đi",
    zone_type_id: "5",
    name: "Đường đi 17",
    code: "DD_0017",
    description: "",
    nodes: [
      {
        id: "node_mock_17",
        x: 2,
        y: 9,
        code: "1-C17",
        name: "1-C17",
        neighbor_mask: "0000"
      }
    ]
  },
  {
    id: "zone_mock_18",
    zone_type_code: "MOVING",
    zone_type_name: "Khu vực đường đi",
    zone_type_id: "5",
    name: "Đường đi 18",
    code: "DD_0018",
    description: "",
    nodes: [
      {
        id: "node_mock_18",
        x: 3,
        y: 9,
        code: "1-C18",
        name: "1-C18",
        neighbor_mask: "0000"
      }
    ]
  },
  {
    id: "zone_mock_19",
    zone_type_code: "MOVING",
    zone_type_name: "Khu vực đường đi",
    zone_type_id: "5",
    name: "Đường đi 19",
    code: "DD_0019",
    description: "",
    nodes: [
      {
        id: "node_mock_19",
        x: 2,
        y: 10,
        code: "1-C19",
        name: "1-C19",
        neighbor_mask: "0000"
      }
    ]
  },
  {
    id: "zone_mock_20",
    zone_type_code: "MOVING",
    zone_type_name: "Khu vực đường đi",
    zone_type_id: "5",
    name: "Đường đi 20",
    code: "DD_0020",
    description: "",
    nodes: [
      {
        id: "node_mock_20",
        x: 3,
        y: 10,
        code: "1-C20",
        name: "1-C20",
        neighbor_mask: "0000"
      }
    ]
  },
  {
    id: "zone_mock_21",
    zone_type_code: "MOVING",
    zone_type_name: "Khu vực đường đi",
    zone_type_id: "5",
    name: "Đường đi 21",
    code: "DD_0021",
    description: "",
    nodes: [
      {
        id: "node_mock_21",
        x: 2,
        y: 11,
        code: "1-C21",
        name: "1-C21",
        neighbor_mask: "0000"
      }
    ]
  },
  {
    id: "zone_mock_22",
    zone_type_code: "MOVING",
    zone_type_name: "Khu vực đường đi",
    zone_type_id: "5",
    name: "Đường đi 22",
    code: "DD_0022",
    description: "",
    nodes: [
      {
        id: "node_mock_22",
        x: 3,
        y: 12,
        code: "1-C22",
        name: "1-C22",
        neighbor_mask: "0000"
      }
    ]
  },
  {
    id: "zone_mock_23",
    zone_type_code: "MOVING",
    zone_type_name: "Khu vực đường đi",
    zone_type_id: "5",
    name: "Đường đi 23",
    code: "DD_0023",
    description: "",
    nodes: [
      {
        id: "node_mock_23",
        x: 4,
        y: 11,
        code: "1-C23",
        name: "1-C23",
        neighbor_mask: "0000"
      }
    ]
  },
  {
    id: "zone_mock_24",
    zone_type_code: "MOVING",
    zone_type_name: "Khu vực đường đi",
    zone_type_id: "5",
    name: "Đường đi 24",
    code: "DD_0024",
    description: "",
    nodes: [
      {
        id: "node_mock_24",
        x: 5,
        y: 11,
        code: "1-C24",
        name: "1-C24",
        neighbor_mask: "0000"
      }
    ]
  },
  {
    id: "zone_mock_25",
    zone_type_code: "MOVING",
    zone_type_name: "Khu vực đường đi",
    zone_type_id: "5",
    name: "Đường đi 25",
    code: "DD_0025",
    description: "",
    nodes: [
      {
        id: "node_mock_25",
        x: 5,
        y: 12,
        code: "1-C25",
        name: "1-C25",
        neighbor_mask: "0000"
      }
    ]
  },
  {
    id: "zone_mock_26",
    zone_type_code: "MOVING",
    zone_type_name: "Khu vực đường đi",
    zone_type_id: "5",
    name: "Đường đi 26",
    code: "DD_0026",
    description: "",
    nodes: [
      {
        id: "node_mock_26",
        x: 4,
        y: 12,
        code: "1-C26",
        name: "1-C26",
        neighbor_mask: "0000"
      }
    ]
  },
  {
    id: "zone_mock_27",
    zone_type_code: "MOVING",
    zone_type_name: "Khu vực đường đi",
    zone_type_id: "5",
    name: "Đường đi 27",
    code: "DD_0027",
    description: "",
    nodes: [
      {
        id: "node_mock_27",
        x: 6,
        y: 11,
        code: "1-C27",
        name: "1-C27",
        neighbor_mask: "0000"
      }
    ]
  },
  {
    id: "zone_mock_28",
    zone_type_code: "MOVING",
    zone_type_name: "Khu vực đường đi",
    zone_type_id: "5",
    name: "Đường đi 28",
    code: "DD_0028",
    description: "",
    nodes: [
      {
        id: "node_mock_28",
        x: 6,
        y: 12,
        code: "1-C28",
        name: "1-C28",
        neighbor_mask: "0000"
      }
    ]
  },
  {
    id: "zone_mock_29",
    zone_type_code: "MOVING",
    zone_type_name: "Khu vực đường đi",
    zone_type_id: "5",
    name: "Đường đi 29",
    code: "DD_0029",
    description: "",
    nodes: [
      {
        id: "node_mock_29",
        x: 6,
        y: 10,
        code: "1-C29",
        name: "1-C29",
        neighbor_mask: "0000"
      }
    ]
  },
  {
    id: "zone_mock_30",
    zone_type_code: "PAKING",
    zone_type_name: "Khu vực đỗ",
    zone_type_id: "2",
    name: "Đường đi 30",
    code: "DD_0030",
    description: "",
    nodes: [
      {
        id: "node_mock_30",
        x: 7,
        y: 9,
        code: "1-C30",
        name: "1-C30",
        neighbor_mask: "0000"
      }
    ]
  },
  {
    id: "zone_mock_31",
    zone_type_code: "MOVING",
    zone_type_name: "Khu vực đường đi",
    zone_type_id: "5",
    name: "Đường đi 31",
    code: "DD_0031",
    description: "",
    nodes: [
      {
        id: "node_mock_31",
        x: 8,
        y: 10,
        code: "1-C31",
        name: "1-C31",
        neighbor_mask: "0000"
      }
    ]
  },
  {
    id: "zone_mock_32",
    zone_type_code: "MOVING",
    zone_type_name: "Khu vực đường đi",
    zone_type_id: "5",
    name: "Đường đi 32",
    code: "DD_0032",
    description: "",
    nodes: [
      {
        id: "node_mock_32",
        x: 8,
        y: 11,
        code: "1-C32",
        name: "1-C32",
        neighbor_mask: "0000"
      }
    ]
  },
  {
    id: "zone_mock_33",
    zone_type_code: "MOVING",
    zone_type_name: "Khu vực đường đi",
    zone_type_id: "5",
    name: "Đường đi 33",
    code: "DD_0033",
    description: "",
    nodes: [
      {
        id: "node_mock_33",
        x: 8,
        y: 12,
        code: "1-C33",
        name: "1-C33",
        neighbor_mask: "0000"
      }
    ]
  },
  {
    id: "zone_mock_34",
    zone_type_code: "MOVING",
    zone_type_name: "Khu vực đường đi",
    zone_type_id: "5",
    name: "Đường đi 34",
    code: "DD_0034",
    description: "",
    nodes: [
      {
        id: "node_mock_34",
        x: 7,
        y: 12,
        code: "1-C34",
        name: "1-C34",
        neighbor_mask: "0000"
      }
    ]
  },
  {
    id: "zone_mock_35",
    zone_type_code: "MOVING",
    zone_type_name: "Khu vực đường đi",
    zone_type_id: "5",
    name: "Đường đi 35",
    code: "DD_0035",
    description: "",
    nodes: [
      {
        id: "node_mock_35",
        x: 7,
        y: 11,
        code: "1-C35",
        name: "1-C35",
        neighbor_mask: "0000"
      }
    ]
  },
  {
    id: "zone_mock_36",
    zone_type_code: "MOVING",
    zone_type_name: "Khu vực đường đi",
    zone_type_id: "5",
    name: "Đường đi 36",
    code: "DD_0036",
    description: "",
    nodes: [
      {
        id: "node_mock_36",
        x: 9,
        y: 11,
        code: "1-C36",
        name: "1-C36",
        neighbor_mask: "0000"
      }
    ]
  },
  {
    id: "zone_mock_37",
    zone_type_code: "MOVING",
    zone_type_name: "Khu vực đường đi",
    zone_type_id: "5",
    name: "Đường đi 37",
    code: "DD_0037",
    description: "",
    nodes: [
      {
        id: "node_mock_37",
        x: 9,
        y: 12,
        code: "1-C37",
        name: "1-C37",
        neighbor_mask: "0000"
      }
    ]
  },
  {
    id: "zone_mock_38",
    zone_type_code: "MOVING",
    zone_type_name: "Khu vực đường đi",
    zone_type_id: "5",
    name: "Đường đi 38",
    code: "DD_0038",
    description: "",
    nodes: [
      {
        id: "node_mock_38",
        x: 10,
        y: 11,
        code: "1-C38",
        name: "1-C38",
        neighbor_mask: "0000"
      }
    ]
  },
  {
    id: "zone_mock_39",
    zone_type_code: "MOVING",
    zone_type_name: "Khu vực đường đi",
    zone_type_id: "5",
    name: "Đường đi 39",
    code: "DD_0039",
    description: "",
    nodes: [
      {
        id: "node_mock_39",
        x: 10,
        y: 12,
        code: "1-C39",
        name: "1-C39",
        neighbor_mask: "0000"
      }
    ]
  },
  {
    id: "zone_mock_40",
    zone_type_code: "MOVING",
    zone_type_name: "Khu vực đường đi",
    zone_type_id: "5",
    name: "Đường đi 40",
    code: "DD_0040",
    description: "",
    nodes: [
      {
        id: "node_mock_40",
        x: 11,
        y: 11,
        code: "1-C40",
        name: "1-C40",
        neighbor_mask: "0000"
      }
    ]
  },
  {
    id: "zone_mock_41",
    zone_type_code: "MOVING",
    zone_type_name: "Khu vực đường đi",
    zone_type_id: "5",
    name: "Đường đi 41",
    code: "DD_0041",
    description: "",
    nodes: [
      {
        id: "node_mock_41",
        x: 11,
        y: 12,
        code: "1-C41",
        name: "1-C41",
        neighbor_mask: "0000"
      }
    ]
  },
  {
    id: "zone_mock_42",
    zone_type_code: "MOVING",
    zone_type_name: "Khu vực đường đi",
    zone_type_id: "5",
    name: "Đường đi 42",
    code: "DD_0042",
    description: "",
    nodes: [
      {
        id: "node_mock_42",
        x: 12,
        y: 11,
        code: "1-C42",
        name: "1-C42",
        neighbor_mask: "0000"
      }
    ]
  },
  {
    id: "zone_mock_43",
    zone_type_code: "MOVING",
    zone_type_name: "Khu vực đường đi",
    zone_type_id: "5",
    name: "Đường đi 43",
    code: "DD_0043",
    description: "",
    nodes: [
      {
        id: "node_mock_43",
        x: 12,
        y: 12,
        code: "1-C43",
        name: "1-C43",
        neighbor_mask: "0000"
      }
    ]
  },
  {
    id: "zone_mock_44",
    zone_type_code: "MOVING",
    zone_type_name: "Khu vực đường đi",
    zone_type_id: "5",
    name: "Đường đi 44",
    code: "DD_0044",
    description: "",
    nodes: [
      {
        id: "node_mock_44",
        x: 13,
        y: 11,
        code: "1-C44",
        name: "1-C44",
        neighbor_mask: "0000"
      }
    ]
  },
  {
    id: "zone_mock_45",
    zone_type_code: "MOVING",
    zone_type_name: "Khu vực đường đi",
    zone_type_id: "5",
    name: "Đường đi 45",
    code: "DD_0045",
    description: "",
    nodes: [
      {
        id: "node_mock_45",
        x: 13,
        y: 12,
        code: "1-C45",
        name: "1-C45",
        neighbor_mask: "0000"
      }
    ]
  },
  {
    id: "zone_mock_46",
    zone_type_code: "MOVING",
    zone_type_name: "Khu vực đường đi",
    zone_type_id: "5",
    name: "Đường đi 46",
    code: "DD_0046",
    description: "",
    nodes: [
      {
        id: "node_mock_46",
        x: 14,
        y: 11,
        code: "1-C46",
        name: "1-C46",
        neighbor_mask: "0000"
      }
    ]
  },
  {
    id: "zone_mock_47",
    zone_type_code: "MOVING",
    zone_type_name: "Khu vực đường đi",
    zone_type_id: "5",
    name: "Đường đi 47",
    code: "DD_0047",
    description: "",
    nodes: [
      {
        id: "node_mock_47",
        x: 14,
        y: 12,
        code: "1-C47",
        name: "1-C47",
        neighbor_mask: "0000"
      }
    ]
  },
  {
    id: "zone_mock_48",
    zone_type_code: "MOVING",
    zone_type_name: "Khu vực đường đi",
    zone_type_id: "5",
    name: "Đường đi 48",
    code: "DD_0048",
    description: "",
    nodes: [
      {
        id: "node_mock_48",
        x: 15,
        y: 11,
        code: "1-C48",
        name: "1-C48",
        neighbor_mask: "0000"
      }
    ]
  },
  {
    id: "zone_mock_49",
    zone_type_code: "MOVING",
    zone_type_name: "Khu vực đường đi",
    zone_type_id: "5",
    name: "Đường đi 49",
    code: "DD_0049",
    description: "",
    nodes: [
      {
        id: "node_mock_49",
        x: 15,
        y: 12,
        code: "1-C49",
        name: "1-C49",
        neighbor_mask: "0000"
      }
    ]
  },
  {
    id: "zone_mock_50",
    zone_type_code: "MOVING",
    zone_type_name: "Khu vực đường đi",
    zone_type_id: "5",
    name: "Đường đi 50",
    code: "DD_0050",
    description: "",
    nodes: [
      {
        id: "node_mock_50",
        x: 16,
        y: 11,
        code: "1-C50",
        name: "1-C50",
        neighbor_mask: "0000"
      }
    ]
  },
  {
    id: "zone_mock_51",
    zone_type_code: "MOVING",
    zone_type_name: "Khu vực đường đi",
    zone_type_id: "5",
    name: "Đường đi 51",
    code: "DD_0051",
    description: "",
    nodes: [
      {
        id: "node_mock_51",
        x: 16,
        y: 12,
        code: "1-C51",
        name: "1-C51",
        neighbor_mask: "0000"
      }
    ]
  },
  {
    id: "zone_mock_52",
    zone_type_code: "MOVING",
    zone_type_name: "Khu vực đường đi",
    zone_type_id: "5",
    name: "Đường đi 52",
    code: "DD_0052",
    description: "",
    nodes: [
      {
        id: "node_mock_52",
        x: 16,
        y: 10,
        code: "1-C52",
        name: "1-C52",
        neighbor_mask: "0000"
      }
    ]
  },
  {
    id: "zone_mock_53",
    zone_type_code: "PAKING",
    zone_type_name: "Khu vực đỗ",
    zone_type_id: "2",
    name: "Đường đi 53",
    code: "DD_0053",
    description: "",
    nodes: [
      {
        id: "node_mock_53",
        x: 17,
        y: 9,
        code: "1-C53",
        name: "1-C53",
        neighbor_mask: "0000"
      }
    ]
  },
  {
    id: "zone_mock_54",
    zone_type_code: "MOVING",
    zone_type_name: "Khu vực đường đi",
    zone_type_id: "5",
    name: "Đường đi 54",
    code: "DD_0054",
    description: "",
    nodes: [
      {
        id: "node_mock_54",
        x: 18,
        y: 10,
        code: "1-C54",
        name: "1-C54",
        neighbor_mask: "0000"
      }
    ]
  },
  {
    id: "zone_mock_55",
    zone_type_code: "MOVING",
    zone_type_name: "Khu vực đường đi",
    zone_type_id: "5",
    name: "Đường đi 55",
    code: "DD_0055",
    description: "",
    nodes: [
      {
        id: "node_mock_55",
        x: 17,
        y: 11,
        code: "1-C55",
        name: "1-C55",
        neighbor_mask: "0000"
      }
    ]
  },
  {
    id: "zone_mock_60",
    zone_type_code: "MOVING",
    zone_type_name: "Khu vực đường đi",
    zone_type_id: "5",
    name: "Đường đi 60",
    code: "DD_0060",
    description: "",
    nodes: [
      {
        id: "node_mock_60",
        x: 17,
        y: 12,
        code: "1-C60",
        name: "1-C60",
        neighbor_mask: "0000"
      }
    ]
  },
  {
    id: "zone_mock_56",
    zone_type_code: "MOVING",
    zone_type_name: "Khu vực đường đi",
    zone_type_id: "5",
    name: "Đường đi 56",
    code: "DD_0056",
    description: "",
    nodes: [
      {
        id: "node_mock_56",
        x: 18,
        y: 11,
        code: "1-C56",
        name: "1-C56",
        neighbor_mask: "0000"
      }
    ]
  },
  {
    id: "zone_mock_57",
    zone_type_code: "MOVING",
    zone_type_name: "Khu vực đường đi",
    zone_type_id: "5",
    name: "Đường đi 57",
    code: "DD_0057",
    description: "",
    nodes: [
      {
        id: "node_mock_57",
        x: 18,
        y: 12,
        code: "1-C57",
        name: "1-C57",
        neighbor_mask: "0000"
      }
    ]
  },
  {
    id: "zone_mock_58",
    zone_type_code: "MOVING",
    zone_type_name: "Khu vực đường đi",
    zone_type_id: "5",
    name: "Đường đi 58",
    code: "DD_0058",
    description: "",
    nodes: [
      {
        id: "node_mock_58",
        x: 19,
        y: 11,
        code: "1-C58",
        name: "1-C58",
        neighbor_mask: "0000"
      }
    ]
  },
  {
    id: "zone_mock_59",
    zone_type_code: "MOVING",
    zone_type_name: "Khu vực đường đi",
    zone_type_id: "5",
    name: "Đường đi 59",
    code: "DD_0059",
    description: "",
    nodes: [
      {
        id: "node_mock_59",
        x: 19,
        y: 12,
        code: "1-C59",
        name: "1-C59",
        neighbor_mask: "0000"
      }
    ]
  },
  {
    id: "zone_mock_61",
    zone_type_code: "MOVING",
    zone_type_name: "Khu vực đường đi",
    zone_type_id: "5",
    name: "Đường đi 61",
    code: "DD_0061",
    description: "",
    nodes: [
      {
        id: "node_mock_61",
        x: 20,
        y: 11,
        code: "1-C61",
        name: "1-C61",
        neighbor_mask: "0000"
      }
    ]
  },
  {
    id: "zone_mock_62",
    zone_type_code: "MOVING",
    zone_type_name: "Khu vực đường đi",
    zone_type_id: "5",
    name: "Đường đi 62",
    code: "DD_0062",
    description: "",
    nodes: [
      {
        id: "node_mock_62",
        x: 20,
        y: 12,
        code: "1-C62",
        name: "1-C62",
        neighbor_mask: "0000"
      }
    ]
  },
  {
    id: "zone_mock_63",
    zone_type_code: "MOVING",
    zone_type_name: "Khu vực đường đi",
    zone_type_id: "5",
    name: "Đường đi 63",
    code: "DD_0063",
    description: "",
    nodes: [
      {
        id: "node_mock_63",
        x: 21,
        y: 11,
        code: "1-C63",
        name: "1-C63",
        neighbor_mask: "0000"
      }
    ]
  },
  {
    id: "zone_mock_64",
    zone_type_code: "MOVING",
    zone_type_name: "Khu vực đường đi",
    zone_type_id: "5",
    name: "Đường đi 64",
    code: "DD_0064",
    description: "",
    nodes: [
      {
        id: "node_mock_64",
        x: 21,
        y: 12,
        code: "1-C64",
        name: "1-C64",
        neighbor_mask: "0000"
      }
    ]
  },
  {
    id: "zone_mock_65",
    zone_type_code: "MOVING",
    zone_type_name: "Khu vực đường đi",
    zone_type_id: "5",
    name: "Đường đi 65",
    code: "DD_0065",
    description: "",
    nodes: [
      {
        id: "node_mock_65",
        x: 22,
        y: 11,
        code: "1-C65",
        name: "1-C65",
        neighbor_mask: "0000"
      }
    ]
  },
  {
    id: "zone_mock_66",
    zone_type_code: "MOVING",
    zone_type_name: "Khu vực đường đi",
    zone_type_id: "5",
    name: "Đường đi 66",
    code: "DD_0066",
    description: "",
    nodes: [
      {
        id: "node_mock_66",
        x: 22,
        y: 12,
        code: "1-C66",
        name: "1-C66",
        neighbor_mask: "0000"
      }
    ]
  },
  {
    id: "zone_mock_67",
    zone_type_code: "MOVING",
    zone_type_name: "Khu vực đường đi",
    zone_type_id: "5",
    name: "Đường đi 67",
    code: "DD_0067",
    description: "",
    nodes: [
      {
        id: "node_mock_67",
        x: 23,
        y: 11,
        code: "1-C67",
        name: "1-C67",
        neighbor_mask: "0000"
      }
    ]
  },
  {
    id: "zone_mock_68",
    zone_type_code: "MOVING",
    zone_type_name: "Khu vực đường đi",
    zone_type_id: "5",
    name: "Đường đi 68",
    code: "DD_0068",
    description: "",
    nodes: [
      {
        id: "node_mock_68",
        x: 23,
        y: 12,
        code: "1-C68",
        name: "1-C68",
        neighbor_mask: "0000"
      }
    ]
  },
  {
    id: "zone_mock_69",
    zone_type_code: "MOVING",
    zone_type_name: "Khu vực đường đi",
    zone_type_id: "5",
    name: "Đường đi 69",
    code: "DD_0069",
    description: "",
    nodes: [
      {
        id: "node_mock_69",
        x: 24,
        y: 11,
        code: "1-C69",
        name: "1-C69",
        neighbor_mask: "0000"
      }
    ]
  },
  {
    id: "zone_mock_70",
    zone_type_code: "MOVING",
    zone_type_name: "Khu vực đường đi",
    zone_type_id: "5",
    name: "Đường đi 70",
    code: "DD_0070",
    description: "",
    nodes: [
      {
        id: "node_mock_70",
        x: 24,
        y: 12,
        code: "1-C70",
        name: "1-C70",
        neighbor_mask: "0000"
      }
    ]
  },
  {
    id: "zone_mock_71",
    zone_type_code: "MOVING",
    zone_type_name: "Khu vực đường đi",
    zone_type_id: "5",
    name: "Đường đi 71",
    code: "DD_0071",
    description: "",
    nodes: [
      {
        id: "node_mock_71",
        x: 25,
        y: 11,
        code: "1-C71",
        name: "1-C71",
        neighbor_mask: "0000"
      }
    ]
  },
  {
    id: "zone_mock_72",
    zone_type_code: "MOVING",
    zone_type_name: "Khu vực đường đi",
    zone_type_id: "5",
    name: "Đường đi 72",
    code: "DD_0072",
    description: "",
    nodes: [
      {
        id: "node_mock_72",
        x: 25,
        y: 12,
        code: "1-C72",
        name: "1-C72",
        neighbor_mask: "0000"
      }
    ]
  },
  {
    id: "zone_mock_73",
    zone_type_code: "MOVING",
    zone_type_name: "Khu vực đường đi",
    zone_type_id: "5",
    name: "Đường đi 73",
    code: "DD_0073",
    description: "",
    nodes: [
      {
        id: "node_mock_73",
        x: 26,
        y: 11,
        code: "1-C73",
        name: "1-C73",
        neighbor_mask: "0000"
      }
    ]
  },
  {
    id: "zone_mock_74",
    zone_type_code: "MOVING",
    zone_type_name: "Khu vực đường đi",
    zone_type_id: "5",
    name: "Đường đi 74",
    code: "DD_0074",
    description: "",
    nodes: [
      {
        id: "node_mock_74",
        x: 26,
        y: 12,
        code: "1-C74",
        name: "1-C74",
        neighbor_mask: "0000"
      }
    ]
  },
  {
    id: "zone_mock_75",
    zone_type_code: "MOVING",
    zone_type_name: "Khu vực đường đi",
    zone_type_id: "5",
    name: "Đường đi 75",
    code: "DD_0075",
    description: "",
    nodes: [
      {
        id: "node_mock_75",
        x: 24,
        y: 13,
        code: "1-C75",
        name: "1-C75",
        neighbor_mask: "0000"
      }
    ]
  },
  {
    id: "zone_mock_76",
    zone_type_code: "MOVING",
    zone_type_name: "Khu vực đường đi",
    zone_type_id: "5",
    name: "Đường đi 76",
    code: "DD_0076",
    description: "",
    nodes: [
      {
        id: "node_mock_76",
        x: 26,
        y: 13,
        code: "1-C76",
        name: "1-C76",
        neighbor_mask: "0000"
      }
    ]
  },
  {
    id: "zone_mock_77",
    zone_type_code: "MOVING",
    zone_type_name: "Khu vực đường đi",
    zone_type_id: "5",
    name: "Đường đi 77",
    code: "DD_0077",
    description: "",
    nodes: [
      {
        id: "node_mock_77",
        x: 24,
        y: 14,
        code: "1-C77",
        name: "1-C77",
        neighbor_mask: "0000"
      }
    ]
  },
  {
    id: "zone_mock_78",
    zone_type_code: "MOVING",
    zone_type_name: "Khu vực đường đi",
    zone_type_id: "5",
    name: "Đường đi 78",
    code: "DD_0078",
    description: "",
    nodes: [
      {
        id: "node_mock_78",
        x: 24,
        y: 15,
        code: "1-C78",
        name: "1-C78",
        neighbor_mask: "0000"
      }
    ]
  },
  {
    id: "zone_mock_79",
    zone_type_code: "MOVING",
    zone_type_name: "Khu vực đường đi",
    zone_type_id: "5",
    name: "Đường đi 79",
    code: "DD_0079",
    description: "",
    nodes: [
      {
        id: "node_mock_79",
        x: 24,
        y: 16,
        code: "1-C79",
        name: "1-C79",
        neighbor_mask: "0000"
      }
    ]
  },
  {
    id: "zone_mock_80",
    zone_type_code: "MOVING",
    zone_type_name: "Khu vực đường đi",
    zone_type_id: "5",
    name: "Đường đi 80",
    code: "DD_0080",
    description: "",
    nodes: [
      {
        id: "node_mock_80",
        x: 24,
        y: 17,
        code: "1-C80",
        name: "1-C80",
        neighbor_mask: "0000"
      }
    ]
  },
  {
    id: "zone_mock_81",
    zone_type_code: "MOVING",
    zone_type_name: "Khu vực đường đi",
    zone_type_id: "5",
    name: "Đường đi 81",
    code: "DD_0081",
    description: "",
    nodes: [
      {
        id: "node_mock_81",
        x: 24,
        y: 18,
        code: "1-C81",
        name: "1-C81",
        neighbor_mask: "0000"
      }
    ]
  },
  {
    id: "zone_mock_82",
    zone_type_code: "MOVING",
    zone_type_name: "Khu vực đường đi",
    zone_type_id: "5",
    name: "Đường đi 82",
    code: "DD_0082",
    description: "",
    nodes: [
      {
        id: "node_mock_82",
        x: 24,
        y: 19,
        code: "1-C82",
        name: "1-C82",
        neighbor_mask: "0000"
      }
    ]
  },
  {
    id: "zone_mock_83",
    zone_type_code: "MOVING",
    zone_type_name: "Khu vực đường đi",
    zone_type_id: "5",
    name: "Đường đi 83",
    code: "DD_0083",
    description: "",
    nodes: [
      {
        id: "node_mock_83",
        x: 24,
        y: 20,
        code: "1-C83",
        name: "1-C83",
        neighbor_mask: "0000"
      }
    ]
  },
  {
    id: "zone_mock_84",
    zone_type_code: "MOVING",
    zone_type_name: "Khu vực đường đi",
    zone_type_id: "5",
    name: "Đường đi 84",
    code: "DD_0084",
    description: "",
    nodes: [
      {
        id: "node_mock_84",
        x: 24,
        y: 21,
        code: "1-C84",
        name: "1-C84",
        neighbor_mask: "0000"
      }
    ]
  },
  {
    id: "zone_mock_85",
    zone_type_code: "MOVING",
    zone_type_name: "Khu vực đường đi",
    zone_type_id: "5",
    name: "Đường đi 85",
    code: "DD_0085",
    description: "",
    nodes: [
      {
        id: "node_mock_85",
        x: 24,
        y: 22,
        code: "1-C85",
        name: "1-C85",
        neighbor_mask: "0000"
      }
    ]
  },
  {
    id: "zone_mock_86",
    zone_type_code: "MOVING",
    zone_type_name: "Khu vực đường đi",
    zone_type_id: "5",
    name: "Đường đi 86",
    code: "DD_0086",
    description: "",
    nodes: [
      {
        id: "node_mock_86",
        x: 24,
        y: 23,
        code: "1-C86",
        name: "1-C86",
        neighbor_mask: "0000"
      }
    ]
  },
  {
    id: "zone_mock_87",
    zone_type_code: "MOVING",
    zone_type_name: "Khu vực đường đi",
    zone_type_id: "5",
    name: "Đường đi 87",
    code: "DD_0087",
    description: "",
    nodes: [
      {
        id: "node_mock_87",
        x: 24,
        y: 24,
        code: "1-C87",
        name: "1-C87",
        neighbor_mask: "0000"
      }
    ]
  },
  {
    id: "zone_mock_88",
    zone_type_code: "MOVING",
    zone_type_name: "Khu vực đường đi",
    zone_type_id: "5",
    name: "Đường đi 88",
    code: "DD_0088",
    description: "",
    nodes: [
      {
        id: "node_mock_88",
        x: 24,
        y: 25,
        code: "1-C88",
        name: "1-C88",
        neighbor_mask: "0000"
      }
    ]
  },
  {
    id: "zone_mock_89",
    zone_type_code: "MOVING",
    zone_type_name: "Khu vực đường đi",
    zone_type_id: "5",
    name: "Đường đi 89",
    code: "DD_0089",
    description: "",
    nodes: [
      {
        id: "node_mock_89",
        x: 26,
        y: 14,
        code: "1-C89",
        name: "1-C89",
        neighbor_mask: "0000"
      }
    ]
  },
  {
    id: "zone_mock_90",
    zone_type_code: "MOVING",
    zone_type_name: "Khu vực đường đi",
    zone_type_id: "5",
    name: "Đường đi 90",
    code: "DD_0090",
    description: "",
    nodes: [
      {
        id: "node_mock_90",
        x: 26,
        y: 15,
        code: "1-C90",
        name: "1-C90",
        neighbor_mask: "0000"
      }
    ]
  },
  {
    id: "zone_mock_91",
    zone_type_code: "MOVING",
    zone_type_name: "Khu vực đường đi",
    zone_type_id: "5",
    name: "Đường đi 91",
    code: "DD_0091",
    description: "",
    nodes: [
      {
        id: "node_mock_91",
        x: 26,
        y: 16,
        code: "1-C91",
        name: "1-C91",
      }
    ]
  },
  {
    id: "zone_mock_92",
    zone_type_code: "MOVING",
    zone_type_name: "Khu vực đường đi",
    zone_type_id: "5",
    name: "Đường đi 92",
    code: "DD_0092",
    description: "",
    nodes: [
      {
        id: "node_mock_92",
        x: 26,
        y: 17,
        code: "1-C92",
        name: "1-C92",
        neighbor_mask: "0000"
      }
    ]
  },
  {
    id: "zone_mock_93",
    zone_type_code: "MOVING",
    zone_type_name: "Khu vực đường đi",
    zone_type_id: "5",
    name: "Đường đi 93",
    code: "DD_0093",
    description: "",
    nodes: [
      {
        id: "node_mock_93",
        x: 26,
        y: 18,
        code: "1-C93",
        name: "1-C93",
        neighbor_mask: "0000"
      }
    ]
  },
  {
    id: "zone_mock_94",
    zone_type_code: "MOVING",
    zone_type_name: "Khu vực đường đi",
    zone_type_id: "5",
    name: "Đường đi 94",
    code: "DD_0094",
    description: "",
    nodes: [
      {
        id: "node_mock_94",
        x: 26,
        y: 19,
        code: "1-C94",
        name: "1-C94",
        neighbor_mask: "0000"
      }
    ]
  },
  {
    id: "zone_mock_95",
    zone_type_code: "MOVING",
    zone_type_name: "Khu vực đường đi",
    zone_type_id: "5",
    name: "Đường đi 95",
    code: "DD_0095",
    description: "",
    nodes: [
      {
        id: "node_mock_95",
        x: 26,
        y: 20,
        code: "1-C95",
        name: "1-C95",
        neighbor_mask: "0000"
      }
    ]
  },
  {
    id: "zone_mock_96",
    zone_type_code: "MOVING",
    zone_type_name: "Khu vực đường đi",
    zone_type_id: "5",
    name: "Đường đi 96",
    code: "DD_0096",
    description: "",
    nodes: [
      {
        id: "node_mock_96",
        x: 26,
        y: 21,
        code: "1-C96",
        name: "1-C96",
        neighbor_mask: "0000"
      }
    ]
  },
  {
    id: "zone_mock_97",
    zone_type_code: "MOVING",
    zone_type_name: "Khu vực đường đi",
    zone_type_id: "5",
    name: "Đường đi 97",
    code: "DD_0097",
    description: "",
    nodes: [
      {
        id: "node_mock_97",
        x: 26,
        y: 22,
        code: "1-C97",
        name: "1-C97",
        neighbor_mask: "0000"
      }
    ]
  },
  {
    id: "zone_mock_98",
    zone_type_code: "MOVING",
    zone_type_name: "Khu vực đường đi",
    zone_type_id: "5",
    name: "Đường đi 98",
    code: "DD_0098",
    description: "",
    nodes: [
      {
        id: "node_mock_98",
        x: 26,
        y: 23,
        code: "1-C98",
        name: "1-C98",
        neighbor_mask: "0000"
      }
    ]
  },
  {
    id: "zone_mock_99",
    zone_type_code: "MOVING",
    zone_type_name: "Khu vực đường đi",
    zone_type_id: "5",
    name: "Đường đi 99",
    code: "DD_0099",
    description: "",
    nodes: [
      {
        id: "node_mock_99",
        x: 26,
        y: 24,
        code: "1-C99",
        name: "1-C99",
        neighbor_mask: "0000"
      }
    ]
  },
  {
    id: "zone_mock_100",
    zone_type_code: "MOVING",
    zone_type_name: "Khu vực đường đi",
    zone_type_id: "5",
    name: "Đường đi 100",
    code: "DD_0100",
    description: "",
    nodes: [
      {
        id: "node_mock_100",
        x: 26,
        y: 25,
        code: "1-C100",
        name: "1-C100",
        neighbor_mask: "0000"
      }
    ]
  },
  {
    id: "zone_mock_101",
    zone_type_code: "CHARGING",
    zone_type_name: "Khu vực sạc",
    zone_type_id: "1",
    name: "Khu vực sạc 1",
    code: "CS_001",
    description: "",
    nodes: [
      {
        id: "node_mock_101",
        x: 25,
        y: 26,
        code: "1-C101",
        name: "1-C101",
        neighbor_mask: "0000"
      }
    ]
  },
  {
    id: "zone_mock_102",
    zone_type_code: "MOVING",
    zone_type_name: "Khu vực đường đi",
    zone_type_id: "5",
    name: "Đường đi 102",
    code: "DD_0102",
    description: "",
    nodes: [
      {
        id: "node_mock_102",
        x: 27,
        y: 11,
        code: "1-C102",
        name: "1-C102",
        neighbor_mask: "0000"
      }
    ]
  },
  {
    id: "zone_mock_103",
    zone_type_code: "MOVING",
    zone_type_name: "Khu vực đường đi",
    zone_type_id: "5",
    name: "Đường đi 103",
    code: "DD_0103",
    description: "",
    nodes: [
      {
        id: "node_mock_103",
        x: 27,
        y: 12,
        code: "1-C103",
        name: "1-C103",
      }
    ]
  },
  {
    id: "zone_mock_104",
    zone_type_code: "MOVING",
    zone_type_name: "Khu vực đường đi",
    zone_type_id: "5",
    name: "Đường đi 104",
    code: "DD_0104",
    description: "",
    nodes: [
      {
        id: "node_mock_104",
        x: 28,
        y: 11,
        code: "1-C104",
        name: "1-C104",
        neighbor_mask: "0000"
      }
    ]
  },
  {
    id: "zone_mock_105",
    zone_type_code: "MOVING",
    zone_type_name: "Khu vực đường đi",
    zone_type_id: "5",
    name: "Đường đi 105",
    code: "DD_0105",
    description: "",
    nodes: [
      {
        id: "node_mock_105",
        x: 28,
        y: 12,
        code: "1-C105",
        name: "1-C105",
        neighbor_mask: "0000"
      }
    ]
  },
  {
    id: "zone_mock_106",
    zone_type_code: "MOVING",
    zone_type_name: "Khu vực đường đi",
    zone_type_id: "5",
    name: "Đường đi 106",
    code: "DD_0106",
    description: "",
    nodes: [
      {
        id: "node_mock_106",
        x: 29,
        y: 11,
        code: "1-C106",
        name: "1-C106",
        neighbor_mask: "0000"
      }
    ]
  },
  {
    id: "zone_mock_107",
    zone_type_code: "MOVING",
    zone_type_name: "Khu vực đường đi",
    zone_type_id: "5",
    name: "Đường đi 107",
    code: "DD_0107",
    description: "",
    nodes: [
      {
        id: "node_mock_107",
        x: 29,
        y: 12,
        code: "1-C107",
        name: "1-C107",
        neighbor_mask: "0000"
      }
    ]
  },
  {
    id: "zone_mock_108",
    zone_type_code: "MOVING",
    zone_type_name: "Khu vực đường đi",
    zone_type_id: "5",
    name: "Đường đi 108",
    code: "DD_0108",
    description: "",
    nodes: [
      {
        id: "node_mock_108",
        x: 30,
        y: 11,
        code: "1-C108",
        name: "1-C108",
        neighbor_mask: "0000"
      }
    ]
  },
  {
    id: "zone_mock_109",
    zone_type_code: "MOVING",
    zone_type_name: "Khu vực đường đi",
    zone_type_id: "5",
    name: "Đường đi 109",
    code: "DD_0109",
    description: "",
    nodes: [
      {
        id: "node_mock_109",
        x: 30,
        y: 12,
        code: "1-C109",
        name: "1-C109",
        neighbor_mask: "0000"
      }
    ]
  },
  {
    id: "zone_mock_110",
    zone_type_code: "MOVING",
    zone_type_name: "Khu vực đường đi",
    zone_type_id: "5",
    name: "Đường đi 110",
    code: "DD_0110",
    description: "",
    nodes: [
      {
        id: "node_mock_110",
        x: 31,
        y: 11,
        code: "1-C110",
        name: "1-C110",
        neighbor_mask: "0000"
      }
    ]
  },
  {
    id: "zone_mock_111",
    zone_type_code: "MOVING",
    zone_type_name: "Khu vực đường đi",
    zone_type_id: "5",
    name: "Đường đi 111",
    code: "DD_0111",
    description: "",
    nodes: [
      {
        id: "node_mock_111",
        x: 31,
        y: 12,
        code: "1-C111",
        name: "1-C111",
        neighbor_mask: "0000"
      }
    ]
  },
  {
    id: "zone_mock_112",
    zone_type_code: "MOVING",
    zone_type_name: "Khu vực đường đi",
    zone_type_id: "5",
    name: "Đường đi 112",
    code: "DD_0112",
    description: "",
    nodes: [
      {
        id: "node_mock_112",
        x: 32,
        y: 11,
        code: "1-C112",
        name: "1-C112",
        neighbor_mask: "0000"
      }
    ]
  },
  {
    id: "zone_mock_113",
    zone_type_code: "MOVING",
    zone_type_name: "Khu vực đường đi",
    zone_type_id: "5",
    name: "Đường đi 113",
    code: "DD_0113",
    description: "",
    nodes: [
      {
        id: "node_mock_113",
        x: 32,
        y: 12,
        code: "1-C113",
        name: "1-C113",
        neighbor_mask: "0000"
      }
    ]
  },
  {
    id: "zone_mock_114",
    zone_type_code: "MOVING",
    zone_type_name: "Khu vực đường đi",
    zone_type_id: "5",
    name: "Đường đi 114",
    code: "DD_0114",
    description: "",
    nodes: [
      {
        id: "node_mock_114",
        x: 33,
        y: 11,
        code: "1-C114",
        name: "1-C114",
        neighbor_mask: "0000"
      }
    ]
  },
  {
    id: "zone_mock_115",
    zone_type_code: "MOVING",
    zone_type_name: "Khu vực đường đi",
    zone_type_id: "5",
    name: "Đường đi 115",
    code: "DD_0115",
    description: "",
    nodes: [
      {
        id: "node_mock_115",
        x: 33,
        y: 12,
        code: "1-C115",
        name: "1-C115",
        neighbor_mask: "0000"
      }
    ]
  },
  {
    id: "zone_mock_116",
    zone_type_code: "MOVING",
    zone_type_name: "Khu vực đường đi",
    zone_type_id: "5",
    name: "Đường đi 116",
    code: "DD_0116",
    description: "",
    nodes: [
      {
        id: "node_mock_116",
        x: 34,
        y: 11,
        code: "1-C116",
        name: "1-C116",
        neighbor_mask: "0000"
      }
    ]
  },
  {
    id: "zone_mock_117",
    zone_type_code: "MOVING",
    zone_type_name: "Khu vực đường đi",
    zone_type_id: "5",
    name: "Đường đi 117",
    code: "DD_0117",
    description: "",
    nodes: [
      {
        id: "node_mock_117",
        x: 34,
        y: 12,
        code: "1-C117",
        name: "1-C117",
        neighbor_mask: "0000"
      }
    ]
  },
  {
    id: "zone_mock_118",
    zone_type_code: "MOVING",
    zone_type_name: "Khu vực đường đi",
    zone_type_id: "5",
    name: "Đường đi 118",
    code: "DD_0118",
    description: "",
    nodes: [
      {
        id: "node_mock_118",
        x: 35,
        y: 11,
        code: "1-C118",
        name: "1-C118",
        neighbor_mask: "0000"
      }
    ]
  },
  {
    id: "zone_mock_119",
    zone_type_code: "MOVING",
    zone_type_name: "Khu vực đường đi",
    zone_type_id: "5",
    name: "Đường đi 119",
    code: "DD_0119",
    description: "",
    nodes: [
      {
        id: "node_mock_119",
        x: 35,
        y: 12,
        code: "1-C119",
        name: "1-C119",
        neighbor_mask: "0000"
      }
    ]
  },
  {
    id: "zone_mock_120",
    zone_type_code: "MOVING",
    zone_type_name: "Khu vực đường đi",
    zone_type_id: "5",
    name: "Đường đi 120",
    code: "DD_0120",
    description: "",
    nodes: [
      {
        id: "node_mock_120",
        x: 36,
        y: 11,
        code: "1-C120",
        name: "1-C120",
        neighbor_mask: "0000"
      }
    ]
  },
  {
    id: "zone_mock_121",
    zone_type_code: "MOVING",
    zone_type_name: "Khu vực đường đi",
    zone_type_id: "5",
    name: "Đường đi 121",
    code: "DD_0121",
    description: "",
    nodes: [
      {
        id: "node_mock_121",
        x: 36,
        y: 12,
        code: "1-C121",
        name: "1-C121",
        neighbor_mask: "0000"
      }
    ]
  },
  {
    id: "zone_mock_122",
    zone_type_code: "MOVING",
    zone_type_name: "Khu vực đường đi",
    zone_type_id: "5",
    name: "Đường đi 122",
    code: "DD_0122",
    description: "",
    nodes: [
      {
        id: "node_mock_122",
        x: 37,
        y: 11,
        code: "1-C122",
        name: "1-C122",
        neighbor_mask: "0000"
      }
    ]
  },
  {
    id: "zone_mock_123",
    zone_type_code: "MOVING",
    zone_type_name: "Khu vực đường đi",
    zone_type_id: "5",
    name: "Đường đi 123",
    code: "DD_0123",
    description: "",
    nodes: [
      {
        id: "node_mock_123",
        x: 37,
        y: 12,
        code: "1-C123",
        name: "1-C123",
        neighbor_mask: "0000"
      }
    ]
  },
  {
    id: "zone_mock_124",
    zone_type_code: "MOVING",
    zone_type_name: "Khu vực đường đi",
    zone_type_id: "5",
    name: "Đường đi 124",
    code: "DD_0124",
    description: "",
    nodes: [
      {
        id: "node_mock_124",
        x: 38,
        y: 11,
        code: "1-C124",
        name: "1-C124",
        neighbor_mask: "0000"
      }
    ]
  },
  {
    id: "zone_mock_125",
    zone_type_code: "MOVING",
    zone_type_name: "Khu vực đường đi",
    zone_type_id: "5",
    name: "Đường đi 125",
    code: "DD_0125",
    description: "",
    nodes: [
      {
        id: "node_mock_125",
        x: 38,
        y: 12,
        code: "1-C125",
        name: "1-C125",
        neighbor_mask: "0000"
      }
    ]
  },
  {
    id: "zone_mock_126",
    zone_type_code: "MOVING",
    zone_type_name: "Khu vực đường đi",
    zone_type_id: "5",
    name: "Đường đi 126",
    code: "DD_0126",
    description: "",
    nodes: [
      {
        id: "node_mock_126",
        x: 39,
        y: 11,
        code: "1-C126",
        name: "1-C126",
        neighbor_mask: "0000"
      }
    ]
  },
  {
    id: "zone_mock_127",
    zone_type_code: "MOVING",
    zone_type_name: "Khu vực đường đi",
    zone_type_id: "5",
    name: "Đường đi 127",
    code: "DD_0127",
    description: "",
    nodes: [
      {
        id: "node_mock_127",
        x: 39,
        y: 12,
        code: "1-C127",
        name: "1-C127",
        neighbor_mask: "0000"
      }
    ]
  },
  {
    id: "zone_mock_128",
    zone_type_code: "MOVING",
    zone_type_name: "Khu vực đường đi",
    zone_type_id: "5",
    name: "Đường đi 128",
    code: "DD_0128",
    description: "",
    nodes: [
      {
        id: "node_mock_128",
        x: 40,
        y: 11,
        code: "1-C128",
        name: "1-C128",
        neighbor_mask: "0000"
      }
    ]
  },
  {
    id: "zone_mock_129",
    zone_type_code: "MOVING",
    zone_type_name: "Khu vực đường đi",
    zone_type_id: "5",
    name: "Đường đi 129",
    code: "DD_0129",
    description: "",
    nodes: [
      {
        id: "node_mock_129",
        x: 40,
        y: 12,
        code: "1-C129",
        name: "1-C129",
      }
    ]
  },
  {
    id: "zone_mock_130",
    zone_type_code: "MOVING",
    zone_type_name: "Khu vực đường đi",
    zone_type_id: "5",
    name: "Đường đi 130",
    code: "DD_0130",
    description: "",
    nodes: [
      {
        id: "node_mock_130",
        x: 41,
        y: 11,
        code: "1-C130",
        name: "1-C130",
        neighbor_mask: "0000"
      }
    ]
  },
  {
    id: "zone_mock_131",
    zone_type_code: "MOVING",
    zone_type_name: "Khu vực đường đi",
    zone_type_id: "5",
    name: "Đường đi 131",
    code: "DD_0131",
    description: "",
    nodes: [
      {
        id: "node_mock_131",
        x: 41,
        y: 12,
        code: "1-C131",
        name: "1-C131",
        neighbor_mask: "0000"
      }
    ]
  },
  {
    id: "zone_mock_132",
    zone_type_code: "MOVING",
    zone_type_name: "Khu vực đường đi",
    zone_type_id: "5",
    name: "Đường đi 132",
    code: "DD_0132",
    description: "",
    nodes: [
      {
        id: "node_mock_132",
        x: 42,
        y: 11,
        code: "1-C132",
        name: "1-C132",
        neighbor_mask: "0000"
      }
    ]
  },
  {
    id: "zone_mock_133",
    zone_type_code: "MOVING",
    zone_type_name: "Khu vực đường đi",
    zone_type_id: "5",
    name: "Đường đi 133",
    code: "DD_0133",
    description: "",
    nodes: [
      {
        id: "node_mock_133",
        x: 42,
        y: 12,
        code: "1-C133",
        name: "1-C133",
        neighbor_mask: "0000"
      }
    ]
  },
  {
    id: "zone_mock_134",
    zone_type_code: "MOVING",
    zone_type_name: "Khu vực đường đi",
    zone_type_id: "5",
    name: "Đường đi 134",
    code: "DD_0134",
    description: "",
    nodes: [
      {
        id: "node_mock_134",
        x: 43,
        y: 11,
        code: "1-C134",
        name: "1-C134",
        neighbor_mask: "0000"
      }
    ]
  },
  {
    id: "zone_mock_135",
    zone_type_code: "MOVING",
    zone_type_name: "Khu vực đường đi",
    zone_type_id: "5",
    name: "Đường đi 135",
    code: "DD_0135",
    description: "",
    nodes: [
      {
        id: "node_mock_135",
        x: 43,
        y: 12,
        code: "1-C135",
        name: "1-C135",
        neighbor_mask: "0000"
      }
    ]
  },
  {
    id: "zone_mock_136",
    zone_type_code: "MOVING",
    zone_type_name: "Khu vực đường đi",
    zone_type_id: "5",
    name: "Đường đi 136",
    code: "DD_0136",
    description: "",
    nodes: [
      {
        id: "node_mock_136",
        x: 44,
        y: 11,
        code: "1-C136",
        name: "1-C136",
        neighbor_mask: "0000"
      }
    ]
  },
  {
    id: "zone_mock_137",
    zone_type_code: "MOVING",
    zone_type_name: "Khu vực đường đi",
    zone_type_id: "5",
    name: "Đường đi 137",
    code: "DD_0137",
    description: "",
    nodes: [
      {
        id: "node_mock_137",
        x: 44,
        y: 12,
        code: "1-C137",
        name: "1-C137",
        neighbor_mask: "0000"
      }
    ]
  },

  {
    id: "zone_mock_139",
    zone_type_code: "MOVING",
    zone_type_name: "Khu vực đường đi",
    zone_type_id: "5",
    name: "Đường đi 139",
    code: "DD_0139",
    description: "",
    nodes: [
      {
        id: "node_mock_139",
        x: 45,
        y: 12,
        code: "1-C139",
        name: "1-C139",
      }
    ]
  },

  {
    id: "zone_mock_141",
    zone_type_code: "MOVING",
    zone_type_name: "Khu vực đường đi",
    zone_type_id: "5",
    name: "Đường đi 141",
    code: "DD_0141",
    description: "",
    nodes: [
      {
        id: "node_mock_141",
        x: 46,
        y: 12,
        code: "1-C141",
        name: "1-C141",
        neighbor_mask: "0000"
      }
    ]
  },

  {
    id: "zone_mock_143",
    zone_type_code: "MOVING",
    zone_type_name: "Khu vực đường đi",
    zone_type_id: "5",
    name: "Đường đi 143",
    code: "DD_0143",
    description: "",
    nodes: [
      {
        id: "node_mock_143",
        x: 47,
        y: 12,
        code: "1-C143",
        name: "1-C143",
        neighbor_mask: "0000"
      }
    ]
  },

  {
    id: "zone_mock_145",
    zone_type_code: "MOVING",
    zone_type_name: "Khu vực đường đi",
    zone_type_id: "5",
    name: "Đường đi 145",
    code: "DD_0145",
    description: "",
    nodes: [
      {
        id: "node_mock_145",
        x: 48,
        y: 12,
        code: "1-C145",
        name: "1-C145",
        neighbor_mask: "0000"
      }
    ]
  },


  {
    id: "zone_mock_148",
    zone_type_code: "MOVING",
    zone_type_name: "Khu vực đường đi",
    zone_type_id: "3",
    name: "Đường đi 148",
    code: "DD_0148",
    description: "",
    nodes: [
      {
        id: "node_mock_148",
        x: 49,
        y: 11,
        code: "1-C148",
        name: "1-C148",
        neighbor_mask: "0000"
      }
    ]
  },
  {
    id: "zone_mock_149",
    zone_type_code: "PICKING",
    zone_type_name: "Khu vực lấy hàng",
    zone_type_id: "3",
    name: "lấy hàng 149",
    code: "DD_0149",
    description: "",
    nodes: [
      {
        id: "node_mock_149",
        x: 49,
        y: 10,
        code: "1-C149",
        name: "1-C149",
        neighbor_mask: "0000"
      }
    ]
  },

  {
    id: "zone_mock_151",
    zone_type_code: "PICKING",
    zone_type_name: "Khu vực lấy hàng",
    zone_type_id: "3",
    name: "Đường đi 151",
    code: "DD_0151",
    description: "",
    nodes: [
      {
        id: "node_mock_151",
        x: 48,
        y: 9,
        code: "1-C151",
        name: "1-C151",
        neighbor_mask: "0000"
      }
    ]
  },
  {
    id: "zone_mock_152",
    zone_type_code: "MOVING",
    zone_type_name: "Khu vực đường đi",
    zone_type_id: "5",
    name: "Đường đi 152",
    code: "DD_0152",
    description: "",
    nodes: [
      {
        id: "node_mock_152",
        x: 47,
        y: 9,
        code: "1-C152",
        name: "1-C152",
        neighbor_mask: "0000"
      }
    ]
  },
  {
    id: "zone_mock_153",
    zone_type_code: "MOVING",
    zone_type_name: "Khu vực đường đi",
    zone_type_id: "5",
    name: "Đường đi 153",
    code: "DD_0153",
    description: "",
    nodes: [
      {
        id: "node_mock_153",
        x: 46,
        y: 9,
        code: "1-C153",
        name: "1-C153",
        neighbor_mask: "0000"
      }
    ]
  },
  {
    id: "zone_mock_154",
    zone_type_code: "MOVING",
    zone_type_name: "Khu vực đường đi",
    zone_type_id: "5",
    name: "Đường đi 154",
    code: "DD_0154",
    description: "",
    nodes: [
      {
        id: "node_mock_154",
        x: 45,
        y: 10,
        code: "1-C154",
        name: "1-C154",
        neighbor_mask: "0000"
      }
    ]
  },
];
