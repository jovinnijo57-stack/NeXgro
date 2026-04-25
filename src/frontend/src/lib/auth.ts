export async function hashPassword(password: string): Promise<string> {
  const msgUint8 = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

export function getRegisteredUsers(): Record<string, string> {
  const usersStr = localStorage.getItem("registered_users");
  if (!usersStr) return {};
  try {
    return JSON.parse(usersStr);
  } catch {
    return {};
  }
}

export function saveRegisteredUser(email: string, hashedPasswordHex: string, profile: any) {
  const users = getRegisteredUsers();
  const lowerEmail = email.toLowerCase();
  users[lowerEmail] = hashedPasswordHex;
  localStorage.setItem("registered_users", JSON.stringify(users));
  
  // Save profile separately
  const profiles = getProfiles();
  profiles[lowerEmail] = profile;
  localStorage.setItem("user_profiles", JSON.stringify(profiles));

  // Handle Referral Bonus
  if (profile.referral && profile.referral.trim().length > 0) {
    // In a real app, you'd verify the code and give both users a bonus
    // For this demo, we'll give the new user $5.00 for using any code
    localStorage.setItem(`wallet_balance_${lowerEmail}`, "5.00");
  } else {
    localStorage.setItem(`wallet_balance_${lowerEmail}`, "0.00");
  }
}

export function getProfiles(): Record<string, any> {
  const pStr = localStorage.getItem("user_profiles");
  if (!pStr) return {};
  try {
    return JSON.parse(pStr);
  } catch {
    return {};
  }
}

export function getUserProfile(email: string): any | null {
  const profiles = getProfiles();
  return profiles[email.toLowerCase()] || null;
}

export function findEmailByPhone(phone: string): string | null {
  const profiles = getProfiles();
  const cleanPhone = phone.replace(/\D/g, "");
  for (const [email, profile] of Object.entries(profiles)) {
    const pPhone = String(profile.phone || "").replace(/\D/g, "");
    if (pPhone === cleanPhone && cleanPhone.length >= 7) {
      return email;
    }
  }
  return null;
}

