import {
  V1AttendanceRecords,
  V1AttendanceState,
  V1Courses,
  V1ScheduledClasses,
  V1SemesterList,
} from "amizone_api";

// === Utilities ===

const OFFSET_IST = 330;
const MINUTE_TO_MS = 60_000;
const DAY_TO_MINUTE = 24 * 60;
const currentTzOffset = new Date().getTimezoneOffset();

const dateToIST = (date: Date): Date =>
  new Date(date.getTime() + (OFFSET_IST - currentTzOffset) * MINUTE_TO_MS);

/**
 * Render a relative date, in days from NOW, to a "YYYY-MM-DD" format.
 * @param {number} d
 * @returns {string}
 */
const renderRelativeDate = (d: number): string => {
  const relativeDate = new Date(
    dateToIST(new Date()).getTime() + d * DAY_TO_MINUTE * MINUTE_TO_MS
  );
  return `${relativeDate.getFullYear()}-${relativeDate.getMonth() + 1
    }-${relativeDate.getDate()}`;
};

const toFormattedPercent = (total: number, went: number) =>
  ((went * 100) / total).toFixed(2);

// === End of utilities ===

/**
 * Renders and returns the attendance message.
 */
export const renderAttendance = (attendance: V1AttendanceRecords) => {
  if (attendance.records === undefined) {
    return "";
  }

  let text = "";
  for (let i = 0; i < attendance.records.length; i += 1) {
    const record = attendance.records[i];
    text += `*Course*: ${record.course?.name ?? "<Unknown>"} *| Code*: ${record?.course?.code || "<Unknown>"
      }
  => ${record?.attendance?.attended}/${record?.attendance?.held
      } (${toFormattedPercent(
        record?.attendance?.held ?? 0,
        record?.attendance?.attended ?? 1
      )}%)

`;
  }
  return text;
};

export const renderCourses = (courses: V1Courses) => {
  let text = "⬇️  Courses  ⬇️ \n";
  if (courses.courses === undefined) {
    return text;
  }

  for (let i = 0; i < courses.courses.length; i += 1) {
    const course = courses.courses[i];
    const { type } = course;
    const code = course.ref?.code;
    const name = course.ref?.name;
    const attendance = `${course?.attendance?.attended}/${course?.attendance?.held
      } (${toFormattedPercent(
        course?.attendance?.held ?? 0,
        course?.attendance?.attended ?? 1
      )}%)`;
    const internalMarks = `${course?.internalMarks?.have}/${course?.internalMarks?.max}`;
    text += `
*Course*: ${name} *| Code*: ${code}
*Type*: ${type}
*Attendance*: ${attendance}
*Internal Marks*: ${internalMarks}
`;
  }
  return text;
};

const ATTENDANCE_STATE_MAP = new Map([
  [`${V1AttendanceState.Present}`, "🟢"],
  [`${V1AttendanceState.Absent}`, "🔴"],
  [`${V1AttendanceState.Pending}`, "🟠"],
]);

export const renderSchedule = (schedule: V1ScheduledClasses) => {
  let text = "";
  text = `*------ Date: ${schedule?.classes?.[0]?.startTime?.substring(
    0,
    10
  )} ------*

`;
  if (schedule.classes === undefined) {
    return text;
  }

  for (let i = 0; i < schedule.classes.length; i += 1) {
    const record = schedule.classes[i];
    text += `*Course*: ${record?.course?.name}
*Faculty Name*: ${record.faculty}
*Room*: ${record.room}
*Time*: ${record?.startTime?.substring(11, 16)} - ${record?.endTime?.substring(
      11,
      16
    )} | *Status*: ${ATTENDANCE_STATE_MAP.get(record?.attendance ?? "") ?? "⚪"}

`;
  }
  return text;
};

export const renderSemester = (semesters: V1SemesterList) => {
  let text = "";
  text = `*Current Semester*: ${semesters?.semesters?.[0]?.name}

`;
  if (semesters.semesters === undefined) {
    return text;
  }

  for (let i = 1; i < semesters.semesters.length; i += 1) {
    const record = semesters.semesters[i];
    text += `*Semester*: ${record.name}

`;
  }
  return text;
};

export const renderWelcomeMessage = () => `\
Welcome the the Amibot Beta, proudly brought to you by the ALiAS Community.

Amibot is an open-source project hosted on fly.io. Source code is available at github.com/asetalias/amibot and open to contributions, bug reports and feature requests!

Join ALiAS, Amity's largest open source community, at asetalias.in ;)
`;

export const renderUsernamePrompt = () => "*Enter Username:*";

export const renderPasswordPrompt = () => "*Enter Password:*";

// Menu. Type: Interactive.
export const renderAmizoneMenu = () => ({
  type: "list",
  header: {
    type: "text",
    text: "Options Menu",
  },
  body: {
    text: "Select an Option",
  },
  action: {
    button: "Menu",
    sections: [
      {
        title: "Options",
        rows: [
          {
            id: "1",
            title: "Attendance",
          },
          {
            id: "2",
            title: "Class Schedule",
          },
          {
            id: "3",
            title: "Courses",
          },
          {
            id: "4",
            title: "Fill Faculty Feedback",
            description: "Submit feedback for all faculty, in one go 🚀",
          },
          {
            id: "5",
            title: "Logout",
          },
        ],
      },
    ],
  },
});

export const renderClassScheduleDateList = () => {
  const dates = new Array(5);
  for (let i = 0; i < 5; i += 1) {
    dates[i] = renderRelativeDate(i - 2);
  }

  return {
    type: "list",
    header: {
      type: "text",
      text: "Date Selection",
    },
    body: {
      text: "Select the Date",
    },
    action: {
      button: "Options",
      sections: [
        {
          title: "Dates",
          rows: dates.map((dateString, index) => ({
            id: index + 1,
            title: dateString,
            description: index === 2 ? "Today" : "",
          })),
        },
      ],
    },
  };
};

export const renderFacultyFeedbackInstructions =
  () => `This method will submit feedback for *all* your faculty in a single step.

Reply with _cancel_ to abort this operation, or with details in the following format:
_*{Score} {Query score} {Comment}*_

where
→ *Score* is a 1-5 score used for most feedback points (higher is better)
→ *Query score* is a 1-3 score used for query feedback (higher is better)
→ *Comment* is a remark that will be sent with the feedback

Example:
_*5 3 Taught us well*_

Please note that the same scores and comments will be used for all faculties with pending feedbacks.`;

export const renderFacultyFeedbackConfirmation = (filledFor: number) =>
  `Faculty feedback has been filled for ${filledFor} faculties.`;
