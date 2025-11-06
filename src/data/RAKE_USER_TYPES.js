export const RAKE_USERS = [4, 5, 6, 7, 9];

export const getUserType = (user_type) => {
  let user_type_name = {
    1: { name: "Admin", class: "admin-text" },
    2: { name: "User", class: "user-text" },
    3: { name: "CNF", class: "cnf-text" },
    4: { name: "Branch Head", class: "cnf-text" },
    5: { name: "CS Officer", class: "cnf-text" },
    6: { name: "Logistics Officer", class: "cnf-text" },
    7: { name: "Logistics Officer (Read)", class: "cnf-text" },
    8: { name: "Secondary Distribution Manager", class: "cnf-text" },
    9: { name: "Sales Account Manager", class: "cnf-text" },
  };
  return user_type_name[user_type];
};
