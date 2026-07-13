const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');
const Student = require('./models/Student');
const Room = require('./models/Room');

const studentsData = [
  { name: 'AYUSH RAJ', email: '26UG031554@paruluniversity.ac.in', id: '26UG031554', room: 'A-301', bed: 1 },
  { name: 'BHEDA DHRUV ARJANBHAI', email: '2516331270001@paruluniversity.ac.in', id: '2516331270001', room: 'A-301', bed: 6 },
  { name: 'RISHABH SINGH', email: '2516331090039@paruluniversity.ac.in', id: '2516331090039', room: 'A-301', bed: 8 },
  { name: 'PIYUSH KUMAR', email: '2303051240157@paruluniversity.ac.in', id: '2303051240157', room: 'A-302', bed: 5 },
  { name: 'AMAN SINGH', email: '2403031570010@paruluniversity.ac.in', id: '2403031570010', room: 'A-302', bed: 8 },
  { name: 'TIWARI ADARSH SUSHIL', email: '2303031050646@paruluniversity.ac.in', id: '2303031050646', room: 'A-303', bed: 1 },
  { name: 'SHASHANK SANTOSHKUMAR AHIRRAO', email: '2501016010026@paruluniversity.ac.in', id: '2501016010026', room: 'A-303', bed: 2 },
  { name: 'PANSURIYA DAKSH LALJIBHAI', email: '2403031460840@paruluniversity.ac.in', id: '2403031460840', room: 'A-303', bed: 3 },
  { name: 'SUVA DEY', email: '2408231010110@paruluniversity.ac.in', id: '2408231010110', room: 'A-303', bed: 4 },
  { name: 'MOHAMMAD RASHID', email: '2503031461062@paruluniversity.ac.in', id: '2503031461062', room: 'A-303', bed: 5 },
  { name: 'MOHAMMED SHAFEEN KHAN', email: '2519411350011@paruluniversity.ac.in', id: '2519411350011', room: 'A-303', bed: 6 },
  { name: 'MOHD.AYAAN KHAN', email: '2503031460484@paruluniversity.ac.in', id: '2503031460484', room: 'A-303', bed: 7 },
  { name: 'DOBARIYA YASHKUMAR NILESHBHAI', email: '2503031267011@paruluniversity.ac.in', id: '2503031267011', room: 'A-303', bed: 8 },
  { name: 'MAURYA VANSH NANDKISHOR', email: '2403031461027@paruluniversity.ac.in', id: '2403031461027', room: 'A-304', bed: 1 },
  { name: 'PARMAR KULDIPSINH RANJITSINH', email: '2405103510009@paruluniversity.ac.in', id: '2405103510009', room: 'A-304', bed: 2 },
  { name: 'BHAKAD AVINASH RAMESH', email: '2405101200075@paruluniversity.ac.in', id: '2405101200075', room: 'A-304', bed: 3 },
  { name: 'RITESH SINGH', email: '2503051240106@paruluniversity.ac.in', id: '2503051240106', room: 'A-304', bed: 4 },
  { name: 'JITESH ISHWAR MALI', email: '26UG035172@paruluniversity.ac.in', id: '26UG035172', room: 'A-304', bed: 5 },
  { name: 'PACHCHIGAR KRISH VARDHAMAN', email: '2503051050125@paruluniversity.ac.in', id: '2503051050125', room: 'A-304', bed: 7 },
  { name: 'DAVID MIUGLE', email: '2406131010389@paruluniversity.ac.in', id: '2406131010389', room: 'A-304', bed: 8 },
  { name: 'SHRIMALI CHETANKUMAR MAHENDRAKUMAR', email: '2304081020086@paruluniversity.ac.in', id: '2304081020086', room: 'A-305', bed: 1 },
  { name: 'RITIK KUMAR', email: '2403051050403@paruluniversity.ac.in', id: '2403051050403', room: 'A-305', bed: 4 },
  { name: 'ANKUR MISHRA', email: '2403031590077@paruluniversity.ac.in', id: '2403031590077', room: 'A-305', bed: 5 },
  { name: 'GONASAPUDI VENKATA NIKHILENDRA', email: '2503031260093@paruluniversity.ac.in', id: '2503031260093', room: 'A-305', bed: 8 },
  { name: 'BARIA TEJPALSINH VIKRAMSINH', email: '2520371010010@paruluniversity.ac.in', id: '2520371010010', room: 'A-306', bed: 1 },
  { name: 'SHUBHAM KUMAR', email: '2516331090048@paruluniversity.ac.in', id: '2516331090048', room: 'A-306', bed: 2 },
  { name: 'ARUNESH TIWARI', email: '2516331300003@paruluniversity.ac.in', id: '2516331300003', room: 'A-306', bed: 3 },
  { name: 'PRINSH KUMAR', email: '2516331090037@paruluniversity.ac.in', id: '2516331090037', room: 'A-306', bed: 4 },
  { name: 'PRINCE SINGH', email: '2403051050872@paruluniversity.ac.in', id: '2403051050872', room: 'A-306', bed: 5 },
  { name: 'TIWARI ARYAN MAHESH', email: '2503031590371@paruluniversity.ac.in', id: '2503031590371', room: 'A-306', bed: 6 },
  { name: 'SURAJ NISHAD', email: '2403051260062@paruluniversity.ac.in', id: '2403051260062', room: 'A-306', bed: 8 },
  { name: 'MOHD AYAN KHAN', email: '2405101270082@paruluniversity.ac.in', id: '2405101270082', room: 'A-307', bed: 1 },
  { name: 'RAHUL CHOUDHARY', email: '2505101010074@paruluniversity.ac.in', id: '2505101010074', room: 'A-307', bed: 3 },
  { name: 'CHAUHAN JAYMIKSINH JAYESHKUMAR', email: '2505101270030@paruluniversity.ac.in', id: '2505101270030', room: 'A-307', bed: 4 },
  { name: 'RAVI KUMAR SAHU', email: '2503031590310@paruluniversity.ac.in', id: '2503031590310', room: 'A-307', bed: 5 },
  { name: 'BEHERA ABHIJIT KESHABCHANDRA', email: '2405101200003@paruluniversity.ac.in', id: '2405101200003', room: 'A-307', bed: 6 },
  { name: 'JOSHI KUNJ DIPAKKUMAR', email: '2405101270283@paruluniversity.ac.in', id: '2405101270283', room: 'A-307', bed: 7 },
  { name: 'RUDRARAJ SINGH', email: '2519411360029@paruluniversity.ac.in', id: '2519411360029', room: 'A-307', bed: 8 },
  { name: 'KUMPAVWAT PRUTHVIRAJ UMMED SINGH', email: '2503031590424@paruluniversity.ac.in', id: '2503031590424', room: 'A-308', bed: 2 },
  { name: 'GANGURDE TANISH DHANRAJ', email: '2503031590141@paruluniversity.ac.in', id: '2503031590141', room: 'A-308', bed: 3 },
  { name: 'AMAN CHOUDHARY', email: '2503031460024@paruluniversity.ac.in', id: '2503031460024', room: 'A-308', bed: 4 },
  { name: 'PRIYANSHU RANJAN', email: '2503031460749@paruluniversity.ac.in', id: '2503031460749', room: 'A-308', bed: 5 },
  { name: 'ARPIT PATIDAR', email: '2503031460467@paruluniversity.ac.in', id: '2503031460467', room: 'A-308', bed: 6 },
  { name: 'VAIBHAV VAISHNAV', email: '2503031461858@paruluniversity.ac.in', id: '2503031461858', room: 'A-308', bed: 7 },
  { name: 'MANNA HEMANTA SANDEEP', email: '2503031460570@paruluniversity.ac.in', id: '2503031460570', room: 'A-308', bed: 8 },
  { name: 'PATEL VRAJ JITENDRAKUMAR', email: '2508231010038@paruluniversity.ac.in', id: '2508231010038', room: 'A-310', bed: 1 },
  { name: 'PANCHAL JAX BHAVESHBHAI', email: '26UG030905@paruluniversity.ac.in', id: '26UG030905', room: 'A-310', bed: 2 },
  { name: 'HEMANTKUMAR RAJNATHBHAI YADAV', email: '26UG052780@paruluniversity.ac.in', id: '26UG052780', room: 'A-310', bed: 3 },
  { name: 'SAKSHAM SETHI', email: '2403031087123@paruluniversity.ac.in', id: '2403031087123', room: 'A-310', bed: 4 },
  { name: 'ABHIJEET RAM', email: '2403051050815@paruluniversity.ac.in', id: '2403051050815', room: 'A-310', bed: 5 },
  { name: 'PANDEY AYUSHYA NAGENDRA', email: '2503031050078@paruluniversity.ac.in', id: '2503031050078', room: 'A-311', bed: 2 },
  { name: 'DABHI OM DHARMENDRABHAI', email: '2503031050207@paruluniversity.ac.in', id: '2503031050207', room: 'A-311', bed: 3 },
  { name: 'KULRAJ SINGH', email: '2503031090032@paruluniversity.ac.in', id: '2503031090032', room: 'A-311', bed: 6 },
  { name: 'PATEL PRIYANSH JITESHKUMAR', email: '2503031090041@paruluniversity.ac.in', id: '2503031090041', room: 'A-311', bed: 7 },
  { name: 'ANKAPURAM SUSHANTH REDDY', email: '26UG010050@paruluniversity.ac.in', id: '26UG010050', room: 'A-312', bed: 1 },
  { name: 'GUNTA GANESH', email: '2403031460381@paruluniversity.ac.in', id: '2403031460381', room: 'A-312', bed: 3 },
  { name: 'KOTIPATRUNI HEMANTH', email: '2403031460383@paruluniversity.ac.in', id: '2403031460383', room: 'A-312', bed: 4 },
  { name: 'KAPADIA MOHAMMAD ZISHAN SIRAZ', email: '2503031050054@paruluniversity.ac.in', id: '2503031050054', room: 'A-312', bed: 5 },
  { name: 'SHINDE SUMIT VITTHALRAO', email: '2503031090061@paruluniversity.ac.in', id: '2503031090061', room: 'A-312', bed: 6 },
  { name: 'REDDY SHRIRAM VENKATRAM', email: '2503031260257@paruluniversity.ac.in', id: '2503031260257', room: 'A-312', bed: 7 },
  { name: 'RUPESH SINGH RAJPUROHIT', email: '2503031260268@paruluniversity.ac.in', id: '2503031260268', room: 'A-313', bed: 1 },
  { name: 'MAHIPAL SINGH RAJPUROHIT', email: '2503031260159@paruluniversity.ac.in', id: '2503031260159', room: 'A-313', bed: 2 },
  { name: 'ESWAR SINGH RAJ PUROHIT', email: '2503396160020@paruluniversity.ac.in', id: '2503396160020', room: 'A-313', bed: 3 },
  { name: 'JAIN DEVESH ANILKUMAR', email: '2403031590223@paruluniversity.ac.in', id: '2403031590223', room: 'A-313', bed: 4 },
  { name: 'LAKHARA MOHIT GIRDARILAL', email: '2403051260068@paruluniversity.ac.in', id: '2403051260068', room: 'A-313', bed: 5 },
  { name: 'OZA NISHITH HITESH', email: '2403031240120@paruluniversity.ac.in', id: '2403031240120', room: 'A-313', bed: 6 },
  { name: 'PATEL KHUSH PANKAJBHAI', email: '2406131200165@paruluniversity.ac.in', id: '2406131200165', room: 'A-313', bed: 7 },
  { name: 'KHALASI RONIT SUNILBHAI', email: '2405101270115@paruluniversity.ac.in', id: '2405101270115', room: 'A-313', bed: 8 },
  { name: 'SUDIPTA MANNA', email: '2403031461003@paruluniversity.ac.in', id: '2403031461003', room: 'A-314', bed: 1 },
  { name: 'MAYANK JAMNADAS RATHOD', email: '2403031570146@paruluniversity.ac.in', id: '2403031570146', room: 'A-314', bed: 4 },
  { name: 'TIRTH BHALIYA', email: '2405101270141@paruluniversity.ac.in', id: '2405101270141', room: 'A-314', bed: 5 },
  { name: 'PRASHANT YADAV', email: '2403051050950@paruluniversity.ac.in', id: '2403051050950', room: 'A-314', bed: 8 },
  { name: 'SURAJ KUMAR SINGH', email: '2403031590312@paruluniversity.ac.in', id: '2403031590312', room: 'A-315', bed: 6 },
  { name: 'PATAN HUSSAIN KHAN', email: '2403031461157@paruluniversity.ac.in', id: '2403031461157', room: 'A-316', bed: 5 },
  { name: 'MALAGE JAGADESH DHAREPPA', email: '2403051051261@paruluniversity.ac.in', id: '2403051051261', room: 'A-317', bed: 1 },
  { name: 'PILLA PAVAN KUMAR', email: '2403031240277@paruluniversity.ac.in', id: '2403031240277', room: 'A-317', bed: 4 },
  { name: 'SURYAWANSHI ROHAN RAJENDRA', email: '2403031461235@paruluniversity.ac.in', id: '2403031461235', room: 'A-318', bed: 1 },
  { name: 'SHAH ANKIT JIGNESH', email: '2506142000078@paruluniversity.ac.in', id: '2506142000078', room: 'A-318', bed: 2 },
  { name: 'RATHOD ALPESH MASRAJI', email: '2403031590292@paruluniversity.ac.in', id: '2403031590292', room: 'A-318', bed: 3 },
  { name: 'TANISHQ SISODIYA', email: '2503051020014@paruluniversity.ac.in', id: '2503051020014', room: 'A-318', bed: 4 },
  { name: 'VIVEK PRAVIN PATEL', email: '2303031010030@paruluniversity.ac.in', id: '2303031010030', room: 'A-318', bed: 7 },
  { name: 'MAKADIYA TIRTH JAYBHAI', email: '26UG031126@paruluniversity.ac.in', id: '26UG031126', room: 'A-318', bed: 8 },
  { name: 'PULI VIVEK', email: '2403031469005@paruluniversity.ac.in', id: '2403031469005', room: 'A-319', bed: 1 },
  { name: 'SATYA PRAKASH KUNUNGO', email: '26PG140005@paruluniversity.ac.in', id: '26PG140005', room: 'A-319', bed: 2 },
  { name: 'TANMAYA KUMAR SAHOO', email: '26PG140016@paruluniversity.ac.in', id: '26PG140016', room: 'A-319', bed: 3 },
  { name: 'ADITYA BARAD', email: '26PG210041@paruluniversity.ac.in', id: '26PG210041', room: 'A-319', bed: 4 },
  { name: 'CHIDIBOMMA GOWTHAM', email: '2303051440024@paruluniversity.ac.in', id: '2303051440024', room: 'A-319', bed: 6 },
  { name: 'A CHANDU', email: '2406131010137@paruluniversity.ac.in', id: '2406131010137', room: 'A-321', bed: 4 },
  { name: 'PAGIDIPALLY MANIKANTH', email: '2403031050196@paruluniversity.ac.in', id: '2403031050196', room: 'A-321', bed: 6 },
  { name: 'BORA AARYAN JITENDRA', email: '2403031461015@paruluniversity.ac.in', id: '2403031461015', room: 'B-301', bed: 2 },
  { name: 'CHAUHAN JAYVEERSINH DEEPAKSINH', email: '2403031080084@paruluniversity.ac.in', id: '2403031080084', room: 'B-301', bed: 3 },
  { name: 'PRAVEEN PRAJAPAT', email: '2419411330026@paruluniversity.ac.in', id: '2419411330026', room: 'B-301', bed: 4 },
  { name: 'KOHINOOR PATIDAR', email: '2407511020040@paruluniversity.ac.in', id: '2407511020040', room: 'B-301', bed: 5 },
  { name: 'PATHAN HAARISH AHEMAD KHAN', email: '2403031460059@paruluniversity.ac.in', id: '2403031460059', room: 'B-301', bed: 6 },
  { name: 'PATIL PARTH NAMDEV', email: '2403051260089@paruluniversity.ac.in', id: '2403051260089', room: 'B-301', bed: 8 },
  { name: 'YASH SINGHAL', email: '2403051050665@paruluniversity.ac.in', id: '2403051050665', room: 'B-302', bed: 4 },
  { name: 'VISHWAS N T', email: '2503031050460@paruluniversity.ac.in', id: '2503031050460', room: 'B-302', bed: 6 },
  { name: 'THUGUTLA KRISHNA SANDEEP REDDY', email: '2303031050642@paruluniversity.ac.in', id: '2303031050642', room: 'B-302', bed: 7 },
  { name: 'BARIYA KAUSHIK KUMAR', email: '2403031461776@paruluniversity.ac.in', id: '2403031461776', room: 'B-303', bed: 6 },
  { name: 'DEVANSH MISHRA', email: '2403051269001@paruluniversity.ac.in', id: '2403051269001', room: 'B-304', bed: 6 },
  { name: 'HITESH SINGH', email: '2303051260016@paruluniversity.ac.in', id: '2303051260016', room: 'B-304', bed: 7 },
  { name: 'DHRUBAJYOTI SINGHA RAY', email: '2403466200046@paruluniversity.ac.in', id: '2403466200046', room: 'B-305', bed: 6 },
  { name: 'VAKAMUDI PRUDHVINESHWAR', email: '2303031260290@paruluniversity.ac.in', id: '2303031260290', room: 'B-306', bed: 2 },
  { name: 'PATIL BHAVESH SHANTILAL', email: '2303031560022@paruluniversity.ac.in', id: '2303031560022', room: 'B-308', bed: 1 },
  { name: 'ROHAN SAHANI', email: '2303051050786@paruluniversity.ac.in', id: '2303051050786', room: 'B-308', bed: 7 },
  { name: 'DHRUV KUMAR SINGH', email: '2303051050230@paruluniversity.ac.in', id: '2303051050230', room: 'B-310', bed: 4 },
  { name: 'YERRABOTHU SHIVA KUMAR REDDY', email: '2403031461372@paruluniversity.ac.in', id: '2403031461372', room: 'B-311', bed: 2 },
  { name: 'BONDLA AVINASH', email: '2403031461251@paruluniversity.ac.in', id: '2403031461251', room: 'B-311', bed: 7 },
  { name: 'NAGAVARAPU KAMESH', email: '2503031461968@paruluniversity.ac.in', id: '2503031461968', room: 'B-312', bed: 3 },
  { name: 'MEKA VARUN MANIKANTA', email: '2503031461245@paruluniversity.ac.in', id: '2503031461245', room: 'B-312', bed: 6 },
  { name: 'SANKURI VISHNU', email: '2303031240136@paruluniversity.ac.in', id: '2303031240136', room: 'B-313', bed: 5 },
  { name: 'PATEL JAINISHBHAI RAMESHBHAI', email: '2403031080113@paruluniversity.ac.in', id: '2403031080113', room: 'B-314', bed: 6 },
  { name: 'NIKAM JAYESH SHARAD', email: '2503031057032@paruluniversity.ac.in', id: '2503031057032', room: 'B-314', bed: 7 },
  { name: 'MADURI VIGNESH', email: '2403031460219@paruluniversity.ac.in', id: '2403031460219', room: 'B-314', bed: 8 },
  { name: 'PAWADE NIRAJ RAJESH', email: '2403031570081@paruluniversity.ac.in', id: '2403031570081', room: 'B-316', bed: 1 },
  { name: 'PATIL PARAS RAJENDRA', email: '2403031570080@paruluniversity.ac.in', id: '2403031570080', room: 'B-316', bed: 3 },
  { name: 'PATIL SOHAM SANJAY', email: '2408211010070@paruluniversity.ac.in', id: '2408211010070', room: 'B-316', bed: 6 },
  { name: 'JOSHI HARD DIPAKKUMAR', email: '2404401020028@paruluniversity.ac.in', id: '2404401020028', room: 'B-316', bed: 8 },
  { name: 'YELVE YASH MANMEET', email: '2403031461241@paruluniversity.ac.in', id: '2403031461241', room: 'B-317', bed: 1 },
  { name: 'SHAAN KALAL', email: '2303051030035@paruluniversity.ac.in', id: '2303051030035', room: 'B-317', bed: 2 },
  { name: 'HARSHIT MEWARA', email: '2403051050699@paruluniversity.ac.in', id: '2403051050699', room: 'B-317', bed: 5 },
  { name: 'KUMAR KESHAV', email: '2505101270255@paruluniversity.ac.in', id: '2505101270255', room: 'B-317', bed: 6 },
  { name: 'JAIVARDHAN SINGH', email: '2403051050256@paruluniversity.ac.in', id: '2403051050256', room: 'B-317', bed: 7 },
  { name: 'BADAL SINGH', email: '2403051051280@paruluniversity.ac.in', id: '2403051051280', room: 'B-317', bed: 8 },
  { name: 'ROHIT', email: '2303031050523@paruluniversity.ac.in', id: '2303031050523', room: 'B-318', bed: 5 },
  { name: 'USNA DATTA', email: '2403031090071@paruluniversity.ac.in', id: '2403031090071', room: 'B-318', bed: 6 },
  { name: 'KEVAL RAGNESHBHAI PATEL', email: '2404401020033@paruluniversity.ac.in', id: '2404401020033', room: 'B-319', bed: 1 },
  { name: 'VAJA NAMANKUMAR KAMLESH', email: '2403396160300@paruluniversity.ac.in', id: '2403396160300', room: 'B-319', bed: 4 },
  { name: 'PATEL RISHI URVISHKUMAR', email: '2403031570078@paruluniversity.ac.in', id: '2403031570078', room: 'B-319', bed: 7 },
  { name: 'BHALGAMIYA JAINIL DHARMENDRABHAI', email: '2404401020011@paruluniversity.ac.in', id: '2404401020011', room: 'B-320', bed: 1 },
  { name: 'KAPIL UPADHYAY', email: '2408531010038@paruluniversity.ac.in', id: '2408531010038', room: 'B-320', bed: 4 },
  { name: 'SHAIKH ZAID HARUN RASID', email: '2408421010088@paruluniversity.ac.in', id: '2408421010088', room: 'B-320', bed: 7 },
  { name: 'ANMOL SAHU', email: '2503051050457@paruluniversity.ac.in', id: '2503051050457', room: 'B-321', bed: 3 },
  { name: 'ANISH KUMAR MOHAN LAL SUTHAR', email: '2403031240087@paruluniversity.ac.in', id: '2403031240087', room: 'B-321', bed: 6 },
  { name: 'SMIT GOVINDBHAI BHARVADIYA', email: '2403031240074@paruluniversity.ac.in', id: '2403031240074', room: 'B-321', bed: 8 },
  { name: 'KUKADIYA BHAUTIK DHARMESHBHAI', email: '2403031050170@paruluniversity.ac.in', id: '2403031050170', room: 'B-322', bed: 8 },
];

const aBlockRooms = [];
for (let r = 301; r <= 321; r++) {
  if (r === 309) continue;
  aBlockRooms.push(`A-${r}`);
}

const bBlockRooms = [];
for (let r = 301; r <= 322; r++) {
  bBlockRooms.push(`B-${r}`);
}

const allRoomNumbers = [...aBlockRooms, ...bBlockRooms];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const existingUsers = await User.countDocuments({ role: { $ne: 'student' } });
    if (existingUsers === 0) {
      console.log('No admin user found. Run the server first to create essential users.');
      process.exit(1);
    }

    await Room.deleteMany({});
    await Student.deleteMany({});
    await User.deleteMany({ role: 'student' });
    console.log('Cleared existing rooms, students, and student users');

    const roomDocs = [];
    for (const rn of allRoomNumbers) {
      const block = rn.startsWith('A') ? 'A' : 'B';
      roomDocs.push({
        roomNumber: rn,
        floor: 3,
        roomType: 'dormitory',
        capacity: 8,
        rentPerMonth: block === 'A' ? 6000 : 5500,
        amenities: ['Bed', 'Desk', 'Chair', 'Wardrobe', 'Fan'],
        status: 'available',
        occupants: [],
      });
    }
    const createdRooms = await Room.insertMany(roomDocs);
    console.log(`Created ${createdRooms.length} rooms`);

    const roomMap = {};
    for (const r of createdRooms) {
      roomMap[r.roomNumber] = r;
    }

    let created = 0;
    let assigned = 0;

    for (const s of studentsData) {
      try {
        const user = await User.create({
          name: s.name,
          email: s.email,
          password: s.id,
          role: 'student',
          phone: '',
          emailVerified: true,
        });

        const studentData = {
          user: user._id,
          studentId: s.id,
          gender: 'male',
          status: 'active',
        };

        if (s.room && roomMap[s.room]) {
          studentData.room = roomMap[s.room]._id;
          studentData.checkInDate = new Date();
          studentData.checkOutDate = null;
        }

        const student = await Student.create(studentData);

        if (s.room && roomMap[s.room]) {
          roomMap[s.room].occupants.push(student._id);
          assigned++;
        }

        created++;
        if (created % 20 === 0) console.log(`  Progress: ${created}/${studentsData.length} students created`);
      } catch (err) {
        console.error(`  Failed to create student ${s.name}: ${err.message}`);
      }
    }

    let occupiedRooms = 0;
    for (const r of createdRooms) {
      if (r.occupants.length > 0) {
        r.status = 'occupied';
        occupiedRooms++;
      }
      await r.save();
    }

    console.log('\n✅ Seed completed!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`  Rooms created:  ${createdRooms.length}`);
    console.log(`  Students added: ${created}`);
    console.log(`  Room assigned:  ${assigned}`);
    console.log(`  Rooms occupied: ${occupiedRooms}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('  Student login password = Student ID');
    console.log('  Example: student ID "26UG031554" means password "26UG031554"');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seed();
