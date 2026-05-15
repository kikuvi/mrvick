$conn = New-Object System.Data.SqlClient.SqlConnection('Data Source=localhost\SQLEXPRESS;Initial Catalog=ShopfrontDb;Integrated Security=True;TrustServerCertificate=True')
$conn.Open()
$cmd = $conn.CreateCommand()

# Wipe existing
$cmd.CommandText = 'DELETE FROM Agents'
$cmd.ExecuteNonQuery() | Out-Null
Write-Host 'Cleared existing agents.'

$agents = @(
  # Coastal, Mountain & Eastern
  @('NYERI','Sun Guest House & Hotel, 1st flr, Opp Central Hotel, Kanisa Road','Mr. John Muguri','0780962620/0729458868','Mr. Brian Litala','701568901','Coastal, Mountain & Eastern'),
  @('MOMBASA/Likoni','Kilindini Plaza, Moi Avenue, 2nd floor','Mr. Nesphory Kitatu','720809741','Mr. Ken Munene','725902185','Coastal, Mountain & Eastern'),
  @('MERU','Solco Investments, Moi Avenue, 2nd floor','Mr. Joshua Kwanda','720900257','Mr. Brian Litala','701568901','Coastal, Mountain & Eastern'),
  @('Embu','KCB building, 1st floor','Mr. Eric Njeru','726406131','Mr. Brian Litala','701568901','Coastal, Mountain & Eastern'),
  @('Machakos','Next to CBM Bank, Kitaga, ground floor B3','Ms. Margdaline Mbevo','790317515','Mr. Patrick Kimani','728668182','Coastal, Mountain & Eastern'),
  @('Voi','Voi town; next to KCB and opp bus stn','Mr. Vincent Omwera','714921891','Mr. Ken Munene','725902185','Coastal, Mountain & Eastern'),
  @('Ukunda','Ukunda near total station','Mr. Jotham Odere','0704912405/0752144097','Mr. Ken Munene','725902185','Coastal, Mountain & Eastern'),
  @('Kilifi','Alaagaf shade opposite NIC Bank','Mr. Jonathan Mark Sikaro','710327690','Mr. Ken Munene','725902185','Coastal, Mountain & Eastern'),
  @('Wote','Next to post office, CBD','Mr. Isaac Musyoki','715488604','Mr. Patrick Kimani','728668182','Coastal, Mountain & Eastern'),
  @('Changamwe','Changamwe stage, next to fly over','Mr. Michael Okotoi','717700982','Mr. Ken Munene','725902185','Coastal, Mountain & Eastern'),
  @('Nanyuki','Kishan towers opp. Standard chartered','Mr. John Maina','729024102','Mr. Brian Litala','701568901','Coastal, Mountain & Eastern'),
  @('Kerugoya','At Total petro station','Mr. Dickson Gichukia','791858191','Mr. Brian Litala','701568901','Coastal, Mountain & Eastern'),
  @('Karatina','At express hotel next to muthokinju','Mr. Robert Kihu','722126775','Mr. Brian Litala','701568901','Coastal, Mountain & Eastern'),
  @('Muranga','Next KCB bank','Mr. Elvis Luvavo','716149702','Mr. Brian Litala','701568901','Coastal, Mountain & Eastern'),
  @('Chuka','Next to Mutegi Murango house','Ms. Lucy Kaaree','721721321','Mr. Brian Litala','701568901','Coastal, Mountain & Eastern'),
  @('Kitui','Opp main stage Kitui','Mr. Paul Kilenga','727510236','Mr. Patrick Kimani','728668182','Coastal, Mountain & Eastern'),
  @('Malindi','Opp Barclays bank, next to poster','Mr. Mwalimu Nyule','708319571','Mr. Ken Munene','725902185','Coastal, Mountain & Eastern'),
  @('Nyali/Bamburi/Kisauni','Leisure Mahutini, along new Malindi road','Mr. Lucas Ogola','729725198','Mr. Ken Munene','725902185','Coastal, Mountain & Eastern'),
  @('Maua','At Solution SACCO','Ms. Truphena Mukiria','714332130','Mr. Brian Litala','701568901','Coastal, Mountain & Eastern'),
  @('Mwingi','Next to main stage','Mr. James Kivunzi','727861878','Mr. Patrick Kimani','728668182','Coastal, Mountain & Eastern'),
  @('Nkubu','Nkubu main stage','Mr. Edward Mbae','714723737','Mr. Brian Litala','701568901','Coastal, Mountain & Eastern'),
  @('Isiolo','KCB Bank Isiolo','Mr. Ephod Munoru','738848889','Mr. Brian Litala','701568901','Coastal, Mountain & Eastern'),
  @('Garissa','Main Stage/CBD','Mr. Solomon Owuor','113768419','Mr. Patrick Kimani','728668182','Coastal, Mountain & Eastern'),
  @('Watamu','NO PHYSICAL OFFICE','Mr. John Mwangi Mkubwa','711403775','Mr. Ken Munene','725902185','Coastal, Mountain & Eastern'),
  # South & North Rift, Western
  @('Kisumu SWAN/AHERO','Mega plaza, 4th floor, wing A, Oginga Ondinga St','Mr. Isaiah Okumu','725886297','Mr. Benson','726646738','South & North Rift, Western'),
  @('BONDO/SIAYA','NO PHYSICAL OFFICE','Mr. Emmanuel Aketch','721637243','Mr. Benson','726646738','South & North Rift, Western'),
  @('BUSIA/UGUNJA','NO PHYSICAL OFFICE','Mr. Felix Opande','718450942','Mr. Benson','726646738','South & North Rift, Western'),
  @('KONDELE/MBALE','NO PHYSICAL OFFICE','Mr. Alfred Adogo','723410565','Mr. Benson','726646738','South & North Rift, Western'),
  @('MUMIAS/KAKAMEGA','NO PHYSICAL OFFICE','Mr. Francis Ogelo','728414235','Mr. Benson','726646738','South & North Rift, Western'),
  @('NAKURU','Merica building, second floor','Mr. Carlos Ouma/Antony Yator','0714323028/0721363608','Mr. Javis','0722231542/0725400500','South & North Rift, Western'),
  @('KERICHO','NO PHYSICAL OFFICE','Mr. Shadrack Kipkoech','720260839','Mr. Jarvis','0722231542/0725400500','South & North Rift, Western'),
  @('NAIVASHA','Next to SamHoliday building','Mr. Joseph Ndirago','748881498','Mr. Jarvis','0722231542/0725400500','South & North Rift, Western'),
  @('NYAHURURU','NO PHYSICAL OFFICE','Mr. Simon Karioki','721765756','Mr. Jarvis','0722231542/0725400500','South & North Rift, Western'),
  @('KABARNET','Kanu office Kabarnet','Mr. James Kibet','714452101','Mr. Jarvis','0722231542/0725400500','South & North Rift, Western'),
  @('LITEIN','Lasoi bookshops next to kipchimatt supermarket','Mr. Zablon Nyarungu','729995775','Mr. Jarvis','0722231542/0725400500','South & North Rift, Western'),
  @('NAROK','NO PHYSICAL OFFICE','Mr. David Mwadhi','726433973','Mr. Jarvis','0722231542/0725400500','South & North Rift, Western'),
  @('BUNGOMA/WEBUYE','NO PHYSICAL OFFICE','Mr. Gardson Karano','700739408','Mr. Benson','726646738','South & North Rift, Western'),
  @('KITALE','Mid africa hotel, kenyatta street','Mr. Michael Difai','721343394','Ms. Anne','727580719','South & North Rift, Western'),
  @('MAKUTANO','Jakaranda','Mr. Peter Obionyi','752563996','Ms. Anne','727580719','South & North Rift, Western'),
  @('KAPSABET & NANDI','Main Stage - Arusai Hotel','Mr. Wisley Rutto','748412081','Ms. Anne','727580719','South & North Rift, Western'),
  @('ELDORET','Eldoret, Burngetuny plaza, 1st floor, Room 19','Mr. Charlse Mutai','728210122','Ms. Anne','727580719','South & North Rift, Western'),
  @('ITEN/ELDORET','Kiprotich Shop, Iten Roundabout, next to KCB Bank','Mr. Wisley Rutto','748412081','Ms. Anne','727580719','South & North Rift, Western'),
  @('HOMABAY','Mazembe building kisumu higway rd','Mr. Felix Ochieng','743041002','Mr. Javan','723529706','South & North Rift, Western'),
  @('MIGORI','Pamela Odongo building, migori county road','Mr. Nicholas Okello','718398253','Mr. Javan','723529706','South & North Rift, Western'),
  @('KISII/Oyugis','Twin towers, 1st floor, Room 103','Mr. Moses Okello/Kenyatta','716794982/0700224610','Mr. Javan','723529706','South & North Rift, Western'),
  @('KEROKA/Bomet','NO PHYSICAL OFFICE','Mr. Alfred Eteng','796113084','Mr. Javan','723529706','South & North Rift, Western'),
  @('Gilgil','NO PHYSICAL OFFICE','Mr. Daniel Kyalo','716038616','Mr. Jarvis','0722231542/0725400500','South & North Rift, Western'),
  @('Olkalau','NO PHYSICAL OFFICE','Mr. Joseph Njuguna','726826496/0739720508','Mr. Jarvis','0722231542/0725400500','South & North Rift, Western'),
  # Nairobi
  @('Moi Avenue','Opp Ibrahims along Moi Avenue','Mr. Isaac Mwalube','791202359','Mr. Denise Odhiambo','724006789','Nairobi'),
  @('Upperhill','Opp Baptist church, Ngong rd','Mr. Joseph Muindi','727222209','Mr. Joseph Njuguna','714387940','Nairobi'),
  @('Jogoo Road','NO PHYSICAL OFFICE','Mr. Douglas Arisi','710378900','Mr. Denise Odhiambo','724006789','Nairobi'),
  @('Westlands','Westlands commercial centre, ring rd','Mr. Joseph Njuguna','714387940','Mr. Joseph Njuguna','714387940','Nairobi'),
  @('Thika','Mburu Plaza, Kwame Nkruma rd','Mr. Luke Ombwayo','718807363','Mr. Fidelis Ouma','724529329','Nairobi'),
  @('Bellevue','Behind Posta, Mchumbi rd, South B','Mr. Victor Okoth','723767307','Mr. Joseph Njuguna','714387940','Nairobi'),
  @('Kahawa Wendani','Municipal mkt Kahawa Wendani','Mr. Kyalo Mwikali','792231105','Mr. Fidelis Ouma','724529329','Nairobi'),
  @('Ruiru','NO PHYSICAL OFFICE','Mr. Kyalo Mwikali','792231105','Mr. Fidelis Ouma','724529329','Nairobi'),
  @('Kiambu','Rexo, Former National Oil stn Kiambu','Mr. Jackson Njaramba','722586096','Mr. Fidelis Ouma','724529329','Nairobi'),
  @('Mlolongo/Kitengela/Athi River/Syokimau','NO PHYSICAL OFFICE','Mr. Daniel Mursoi','0711479075/0729524088','Mr. Denise Odhiambo','724006789','Nairobi'),
  @('Langata','Nikla house, Kitengela rd, Langata','Mr. Victor Okoth','723767307','Mr. Joseph Njuguna','714387940','Nairobi'),
  @('Ngong','Survey','Mr. Michael Mwita','710382851','Mr. Joseph Njuguna','714387940','Nairobi'),
  @('Survey','NO PHYSICAL OFFICE','Mr. Ian Wacheke','708294884','Mr. Fidelis Ouma','724529329','Nairobi'),
  @('Limuru','NO PHYSICAL OFFICE','Mr. Benard Juma','718881322','Mr. Fidelis Ouma','724529329','Nairobi'),
  @('Kikuyu','May house, Kikuyu','Mr. Joshua Kiratu','715527848','Mr. Joseph Njuguna','714387940','Nairobi'),
  @('Uthiru','Matant house, Uthiru','Mr. Joshua Kiratu','715527848','Mr. Joseph Njuguna','714387940','Nairobi'),
  @('Rongai','Rubis Rongai','Mr. Michael Mwita','710382851','Mr. Joseph Njuguna','714387940','Nairobi'),
  @('Kajiado Town','Eastmart Kajiado','Mr. Gerald Okoth','722621685','Mr. Denise Odhiambo','724006789','Nairobi')
)

foreach ($a in $agents) {
  $id = [System.Guid]::NewGuid().ToString()
  $b  = $a[0].Replace("'","''")
  $pl = $a[1].Replace("'","''")
  $st = $a[2].Replace("'","''")
  $co = $a[3].Replace("'","''")
  $tl = $a[4].Replace("'","''")
  $tc = $a[5].Replace("'","''")
  $rg = $a[6].Replace("'","''")
  $cmd.CommandText = "INSERT INTO Agents (Id,Bureau,PhysicalLocation,Staff,Contact,TeamLeader,TeamLeaderContact,Company,Region,CreatedAt) VALUES ('$id','$b','$pl','$st','$co','$tl','$tc','Standard','$rg',GETUTCDATE())"
  $cmd.ExecuteNonQuery() | Out-Null
}

$cmd.CommandText = 'SELECT Region, COUNT(*) as cnt FROM Agents GROUP BY Region ORDER BY Region'
$r = $cmd.ExecuteReader()
while ($r.Read()) { Write-Host ($r['Region'] + ': ' + $r['cnt'] + ' agents') }
$conn.Close()
Write-Host 'Done.'
