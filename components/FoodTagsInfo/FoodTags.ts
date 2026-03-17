export type Tag = {
    label: string;
    color: string;
    textColor?: string; // optional text color for better contrast
}

export const availableTags: Tag[] = [
  { label: "sweet", color: "#F28FB0"},
  { label: "savory", color: "#A7C68B"},
  { label: "crunchy", color: "#FF9400"},
  { label: "firm", color: "#6BB9AD"}, 
  { label: "soft", color: "#FFB7C6"},
  { label: "chewy", color: "#EEC036"},
  { label: "creamy", color: "#F8E6D1", textColor: "#6A6767"}, // custom text color as the tag is too pale for white
  { label: "sticky", color: "#D16D8B"},
  { label: "dry", color: "#BFC5C2", textColor: "#6A6767"},
  { label: "warm", color: "#DF7471"},
  { label: "hot", color: "#FF4B3E"},
  { label: "cool", color: "#4F7DA7"},
  { label: "cold", color: "#A5D8FF", textColor: "#6A6767"},
  { label: "crumbly", color: "#f7a663d9"}, // no figma color, subject to change
]

export const prepTimeTags: Tag[] = [
  { label: "minimal prep", color: "#E0C5F0", textColor: "#6A6767" },
  { label: "moderate prep", color: "#9D7BAE" },
  { label: "full prep", color: "#775587" },
]

export const stockTags: Tag[] = [
  { label: "in stock", color: "#A5D721", textColor: "#6A6767" },
  { label: "low stock", color: "#FFF017", textColor: "#6A6767" },  // custom text color as the tag is too pale for white
  { label: "out of stock", color: "#BF503F" }
]