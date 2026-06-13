import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { Save, Upload, Image as ImageIcon, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'
import type { PageContent } from '../../types'

const SECTIONS: Record<string, { key: string; label: string; titleLabel?: string; contentLabel?: string; image?: boolean }[]> = {
  Home: [
    { key: 'about',     label: 'About FECT',        titleLabel: 'Section Heading', contentLabel: 'Body Text' },
    { key: 'donate_cta',label: 'Donate CTA',         titleLabel: 'Heading',         contentLabel: 'Description' },
    { key: 'stat_1',    label: 'Stat 1',             titleLabel: 'Value (e.g. 1200+)', contentLabel: 'Label (e.g. Students Supported)' },
    { key: 'stat_2',    label: 'Stat 2',             titleLabel: 'Value',           contentLabel: 'Label' },
    { key: 'stat_3',    label: 'Stat 3',             titleLabel: 'Value',           contentLabel: 'Label' },
    { key: 'stat_4',    label: 'Stat 4',             titleLabel: 'Value',           contentLabel: 'Label' },
    { key: 'process_1', label: 'Process Step 1',     titleLabel: 'Step Title',      contentLabel: 'Description' },
    { key: 'process_2', label: 'Process Step 2',     titleLabel: 'Step Title',      contentLabel: 'Description' },
    { key: 'process_3', label: 'Process Step 3',     titleLabel: 'Step Title',      contentLabel: 'Description' },
    { key: 'process_4', label: 'Process Step 4',     titleLabel: 'Step Title',      contentLabel: 'Description' },
  ],
  'Our Story': [
    { key: 'hero',      label: 'Hero Banner',        titleLabel: 'Page Title',      contentLabel: 'Subtitle', image: true },
    { key: 'founding',  label: 'Our Story',          titleLabel: 'Section Heading', contentLabel: 'Story Text (separate paragraphs with a blank line)' },
    { key: 'video_1',   label: 'YouTube Video 1 (right column)', titleLabel: 'YouTube URL or Video ID', contentLabel: 'Caption (optional)' },
    { key: 'video_2',   label: 'YouTube Video 2 (right column)', titleLabel: 'YouTube URL or Video ID', contentLabel: 'Caption (optional)' },
    { key: 'value_1',   label: 'Core Value 1',       titleLabel: 'Value Name',      contentLabel: 'Description' },
    { key: 'value_2',   label: 'Core Value 2',       titleLabel: 'Value Name',      contentLabel: 'Description' },
    { key: 'value_3',   label: 'Core Value 3',       titleLabel: 'Value Name',      contentLabel: 'Description' },
    { key: 'reg_number',label: 'Registration Number',titleLabel: 'Value',           contentLabel: '' },
    { key: 'reg_date',  label: 'Registration Date',  titleLabel: 'Value',           contentLabel: '' },
    { key: 'reg_type',  label: 'Trust Type',         titleLabel: 'Value',           contentLabel: '' },
    { key: 'reg_section',label: '80G Note',          titleLabel: 'Value',           contentLabel: '' },
  ],
  'Our Services': [
    { key: 'hero',                  label: 'Hero Banner',                    titleLabel: 'Page Title', contentLabel: 'Subtitle', image: true },
    { key: 'education',             label: 'Education — Title, Desc & Image',titleLabel: 'Title',      contentLabel: 'Description', image: true },
    { key: 'education_bullets',     label: 'Education — Bullet Points',      titleLabel: '',           contentLabel: 'One bullet per line' },
    { key: 'village_camps',         label: 'Village Camps — Title, Desc & Image', titleLabel: 'Title', contentLabel: 'Description', image: true },
    { key: 'village_camps_bullets', label: 'Village Camps — Bullets',        titleLabel: '',           contentLabel: 'One bullet per line' },
    { key: 'medical',               label: 'Medical — Title, Desc & Image',  titleLabel: 'Title',      contentLabel: 'Description', image: true },
    { key: 'medical_bullets',       label: 'Medical — Bullets',              titleLabel: '',           contentLabel: 'One bullet per line' },
    { key: 'aged',                  label: 'Aged & Challenged — Title, Desc & Image', titleLabel: 'Title', contentLabel: 'Description', image: true },
    { key: 'aged_bullets',          label: 'Aged & Challenged — Bullets',    titleLabel: '',           contentLabel: 'One bullet per line' },
    { key: 'special_children',      label: 'Special Children — Title, Desc & Image', titleLabel: 'Title', contentLabel: 'Description', image: true },
    { key: 'special_children_bullets', label: 'Special Children — Bullets', titleLabel: '',            contentLabel: 'One bullet per line' },
    { key: 'annadanam',             label: 'Annadanam — Title, Desc & Image',titleLabel: 'Title',      contentLabel: 'Description', image: true },
    { key: 'annadanam_bullets',     label: 'Annadanam — Bullets',            titleLabel: '',           contentLabel: 'One bullet per line' },
    { key: 'elders',                label: 'Elders Support — Title, Desc & Image', titleLabel: 'Title', contentLabel: 'Description', image: true },
    { key: 'elders_bullets',        label: 'Elders Support — Bullets',       titleLabel: '',           contentLabel: 'One bullet per line' },
  ],
  'Our Mission': [
    { key: 'hero',         label: 'Hero Banner',      titleLabel: 'Page Title',      contentLabel: 'Subtitle', image: true },
    { key: 'mission',      label: 'Mission Statement',titleLabel: 'Heading',         contentLabel: 'Body Text' },
    { key: 'vision',       label: 'Vision Statement', titleLabel: 'Heading',         contentLabel: 'Body Text' },
    { key: 'values_intro', label: 'Goals Section',    titleLabel: 'Section Heading', contentLabel: 'Description' },
    { key: 'goal_1',       label: 'Goal 1',           titleLabel: 'Title',           contentLabel: 'Description' },
    { key: 'goal_2',       label: 'Goal 2',           titleLabel: 'Title',           contentLabel: 'Description' },
    { key: 'goal_3',       label: 'Goal 3',           titleLabel: 'Title',           contentLabel: 'Description' },
    { key: 'goal_4',       label: 'Goal 4',           titleLabel: 'Title',           contentLabel: 'Description' },
  ],
  'Our Work Process': [
    { key: 'hero',         label: 'Hero Banner',          titleLabel: 'Page Title',      contentLabel: 'Subtitle', image: true },
    { key: 'step_1',       label: 'Stage 1',              titleLabel: 'Title',           contentLabel: 'Description' },
    { key: 'step_2',       label: 'Stage 2',              titleLabel: 'Title',           contentLabel: 'Description' },
    { key: 'step_3',       label: 'Stage 3',              titleLabel: 'Title',           contentLabel: 'Description' },
    { key: 'step_4',       label: 'Stage 4',              titleLabel: 'Title',           contentLabel: 'Description' },
    { key: 'detail_1',     label: 'Detail Step 1',        titleLabel: 'Title',           contentLabel: 'Description' },
    { key: 'detail_2',     label: 'Detail Step 2',        titleLabel: 'Title',           contentLabel: 'Description' },
    { key: 'detail_3',     label: 'Detail Step 3',        titleLabel: 'Title',           contentLabel: 'Description' },
    { key: 'detail_4',     label: 'Detail Step 4',        titleLabel: 'Title',           contentLabel: 'Description' },
    { key: 'detail_5',     label: 'Detail Step 5',        titleLabel: 'Title',           contentLabel: 'Description' },
    { key: 'detail_6',     label: 'Detail Step 6',        titleLabel: 'Title',           contentLabel: 'Description' },
    { key: 'detail_7',     label: 'Detail Step 7',        titleLabel: 'Title',           contentLabel: 'Description' },
    { key: 'detail_8',     label: 'Detail Step 8',        titleLabel: 'Title',           contentLabel: 'Description' },
    { key: 'homes_title',  label: 'Homes Section Heading', titleLabel: 'Heading', contentLabel: '' },
    { key: 'homes_content',label: 'Homes Section Body',    titleLabel: '',        contentLabel: 'Body Text' },
    { key: 'homes_image',  label: 'Homes Section Photo',   titleLabel: '',        contentLabel: '', image: true },
  ],
  'Who We Are': [
    { key: 'hero',    label: 'Hero Banner',      titleLabel: 'Page Title',      contentLabel: 'Subtitle', image: true },
    { key: 'origin',  label: 'Origin Story',     titleLabel: 'Section Heading', contentLabel: 'Body Text' },
    { key: 'growth',  label: 'Growth Section',   titleLabel: 'Section Heading', contentLabel: 'Body Text' },
    { key: 'today',   label: 'FECT Today',       titleLabel: 'Section Heading', contentLabel: 'Body Text' },
    { key: 'stat_founded',  label: 'Stat: Founded',   titleLabel: 'Value (e.g. 2009)',  contentLabel: 'Label' },
    { key: 'stat_members',  label: 'Stat: Members',   titleLabel: 'Value (e.g. 40+)',   contentLabel: 'Label' },
    { key: 'stat_students', label: 'Stat: Students',  titleLabel: 'Value (e.g. 1,200+)',contentLabel: 'Label' },
    { key: 'stat_districts',label: 'Stat: Districts', titleLabel: 'Value (e.g. 12+)',   contentLabel: 'Label' },
    { key: 'sidebar_image', label: 'Sidebar Photo',  titleLabel: '', contentLabel: '', image: true },
    { key: 'value_1', label: 'Value 1', titleLabel: 'Title', contentLabel: 'Description' },
    { key: 'value_2', label: 'Value 2', titleLabel: 'Title', contentLabel: 'Description' },
    { key: 'value_3', label: 'Value 3', titleLabel: 'Title', contentLabel: 'Description' },
    { key: 'value_4', label: 'Value 4', titleLabel: 'Title', contentLabel: 'Description' },
  ],
  'What You Can Do': [
    { key: 'hero',          label: 'Hero Banner',         titleLabel: 'Page Title',      contentLabel: 'Subtitle', image: true },
    { key: 'intro',         label: 'Intro Section',       titleLabel: 'Heading',         contentLabel: 'Body Text' },
    { key: 'refer_student', label: 'Refer a Student Card',titleLabel: 'Title',           contentLabel: 'Description' },
    { key: 'refer_home',    label: 'Refer a Home Card',   titleLabel: 'Title',           contentLabel: 'Description' },
    { key: 'donate',        label: 'Donate Card',         titleLabel: 'Title',           contentLabel: 'Description' },
    { key: 'become_member', label: 'Become a Member Card',titleLabel: 'Title',           contentLabel: 'Description' },
    { key: 'spread_word',   label: 'Spread the Word Card',titleLabel: 'Title',           contentLabel: 'Description' },
  ],
  'Refer a Student': [
    { key: 'hero',  label: 'Hero Banner', titleLabel: 'Page Title', contentLabel: 'Subtitle', image: true },
    { key: 'intro', label: 'Intro Text',  titleLabel: '',           contentLabel: 'Body Text' },
  ],
  'Refer a Home': [
    { key: 'hero',  label: 'Hero Banner', titleLabel: 'Page Title', contentLabel: 'Subtitle', image: true },
    { key: 'intro', label: 'Intro Text',  titleLabel: '',           contentLabel: 'Body Text' },
  ],
  'Become a Member': [
    { key: 'hero',        label: 'Hero Banner',         titleLabel: 'Page Title',  contentLabel: 'Subtitle', image: true },
    { key: 'intro',       label: 'Intro Text',          titleLabel: '',            contentLabel: 'Body Text' },
    { key: 'req_title',   label: 'Requirements Heading',titleLabel: 'Heading',     contentLabel: '' },
    { key: 'req_content', label: 'Requirements Body',   titleLabel: '',            contentLabel: 'Body Text' },
  ],
  'Spread the Word': [
    { key: 'hero',    label: 'Hero Banner',     titleLabel: 'Page Title',      contentLabel: 'Subtitle', image: true },
    { key: 'intro',   label: 'Intro Text',      titleLabel: '',                contentLabel: 'Body Text' },
    { key: 'share_1', label: 'Share Method 1',  titleLabel: 'Title',           contentLabel: 'Description' },
    { key: 'share_2', label: 'Share Method 2',  titleLabel: 'Title',           contentLabel: 'Description' },
    { key: 'share_3', label: 'Share Method 3',  titleLabel: 'Title',           contentLabel: 'Description' },
    { key: 'share_4', label: 'Share Method 4',  titleLabel: 'Title',           contentLabel: 'Description' },
  ],
  Gallery: [
    { key: 'hero', label: 'Hero Banner', titleLabel: 'Page Title', contentLabel: 'Subtitle', image: true },
  ],
  Testimonials: [
    { key: 'hero', label: 'Hero Banner', titleLabel: 'Page Title', contentLabel: 'Subtitle', image: true },
  ],
  Contact: [
    { key: 'hero',           label: 'Hero Banner',        titleLabel: 'Page Title',  contentLabel: 'Subtitle', image: true },
    { key: 'info',           label: 'Intro Text',         titleLabel: 'Heading',     contentLabel: 'Body Text' },
    { key: 'member_title',   label: 'Membership Card',    titleLabel: 'Card Heading',contentLabel: '' },
    { key: 'member_content', label: 'Membership Body',    titleLabel: '',            contentLabel: 'Body Text' },
  ],
  Donate: [
    { key: 'hero',   label: 'Hero Banner',   titleLabel: 'Page Title',    contentLabel: 'Subtitle', image: true },
    { key: 'intro',  label: 'Intro Section', titleLabel: 'Heading',       contentLabel: 'Description' },
    { key: 'tier_1', label: 'Donation Tier 1', titleLabel: 'Amount (e.g. ₹500/month)', contentLabel: 'Name|Description  (pipe-separated, e.g. Educate a Child|Sponsor school fees...)' },
    { key: 'tier_2', label: 'Donation Tier 2', titleLabel: 'Amount', contentLabel: 'Name|Description' },
    { key: 'tier_3', label: 'Donation Tier 3', titleLabel: 'Amount', contentLabel: 'Name|Description' },
    { key: 'tier_4', label: 'Donation Tier 4', titleLabel: 'Amount', contentLabel: 'Name|Description' },
  ],
}

// Default content matching each page's hardcoded fallbacks
const PAGE_DEFAULTS: Record<string, Record<string, { title?: string; content?: string }>> = {
  our_services: {
    hero:                   { title: 'Our Services',                     content: 'Seven focused programmes — education, medical care, village outreach, and community support — transforming lives across Tamil Nadu.' },
    education:              { title: 'Education Support',                content: 'FECT has a reliable network to identify and support academically strong students who require financial assistance. We believe no child should be denied education due to poverty.' },
    education_bullets:      { content: 'School fees, uniforms, stationery, and notebooks for poor students\nSemester fees, hostel charges, and career guidance for graduates\nSpecial initiatives for orphans and children with special needs\nAnnual camps offering yoga, health checkups, games, and meals\nRemote village school support with educational supplies' },
    village_camps:          { title: 'Camp for Village Students',        content: 'We reach out to remote and underserved schools in villages, providing infrastructure improvements, one-day engagement activities, and annual educational supply distribution.' },
    village_camps_bullets:  { content: 'Identifies underserved remote schools across Tamil Nadu\nInfrastructure improvements including floors and school furniture\nOne-day engagement activities and games for children\nAnnual educational supply distribution to students\nBuilding lasting connections with rural communities' },
    medical:                { title: 'Medical Services',                 content: 'We extend financial and logistical support for emergency medical cases, surgical treatments, and ongoing care for critically ill patients including cancer survivors.' },
    medical_bullets:        { content: 'Emergency medical treatment and surgical assistance\nBlood donation coordination and awareness drives\nAnnual support for cancer patients — food and necessities\nConnecting patients with the right medical facilities\nFinancial aid for families facing medical crises' },
    aged:                   { title: 'Support for Aged & Challenged',    content: 'We provide consistent, compassionate support to orphanages and homes for elderly and mentally challenged individuals — ensuring dignity and comfort through regular visits and provisions.' },
    aged_bullets:           { content: 'Monthly sponsorship of 4–5 orphanage and care facilities\nFood provisions tailored to the preferences of residents\nClothing and essential items like cots and bedsheets\nRegular personal visits to maintain human connection\nCoordinating volunteers for on-ground assistance' },
    special_children:       { title: 'Support for Special Children',     content: 'Children with special needs deserve the same opportunities and joys as any other child. FECT provides educational sponsorship, meals, toys, and home facility support tailored to their unique needs.' },
    special_children_bullets:{ content: 'Educational sponsorship for children with special needs\nHomemade nutritious meals delivered with care\nSpecially designed toys and stimulating clothing\nHome facility support and accessibility improvements\nEngaging activities and events to build joy and confidence' },
    annadanam:              { title: 'Food Sponsor / Annadanam',         content: 'We cook and serve delicious, wholesome meals ourselves — feeding approximately 100 people daily including elders, children, and individuals on the roadside who have no other means.' },
    annadanam_bullets:      { content: 'Daily meal service for approximately 100 people\nServes elders, children, and roadside individuals\nMeals cooked personally by FECT volunteers\nFestival special meal events and distributions\nNutritionally balanced, home-style cooking' },
    elders:                 { title: 'Support for Elders & Roadside Residents', content: 'We ensure the elderly and roadside residents are not forgotten — providing seasonal clothing, bedsheets during monsoon, food provisions, and fulfilling their personalised wishlists.' },
    elders_bullets:         { content: 'Festival clothing distributions for elders\nMonsoon season bedsheet and blanket sponsorship\nRegular food provisions and grocery deliveries\nPersonalised wishlist fulfilment for residents\nCompassionate visits and community engagement' },
  },
  our_mission: {
    hero:         { title: 'Our Mission',         content: 'Channelling collective compassion into lasting change — one student, one family, one community at a time.' },
    mission:      { title: 'Our Mission',         content: 'We are a group of members from various fields who joined hands together to provide education to the deserving poor and needy children. Our aim is to motivate these students so that when they become leaders of tomorrow, they will help their fellow brethren to pursue education — creating a self-sustaining cycle of upliftment.' },
    vision:       { title: 'Our Vision',          content: 'Education is the only panacea for poverty. A society in which every child, regardless of economic background, has access to quality education and the opportunity to build a dignified life. When youthful energy is channelled productively through education, it becomes a shield against destitution, violence, and addiction.' },
    values_intro: { title: 'What Drives Us',      content: 'Three principles guide every decision we make at FECT — from selecting beneficiaries to managing donations.' },
    goal_1:       { title: 'Education for All',   content: 'Sponsor school and college fees, books, and uniforms for underprivileged children who show academic promise but lack financial means.' },
    goal_2:       { title: 'Community Strength',  content: 'Build a network of committed members and donors who act as a collective safety net for families facing crises beyond their control.' },
    goal_3:       { title: 'Long-term Impact',    content: 'Ensure our beneficiaries do not just survive but thrive — monitoring progress and providing mentorship alongside financial support.' },
    goal_4:       { title: 'Awareness & Advocacy',content: 'Spread the message that a single act of generosity multiplies across generations and encourages others to join our cause.' },
  },
  our_work_process: {
    hero:          { title: 'Our Work Process',           content: 'A transparent, step-by-step approach ensuring every rupee reaches those who truly need it.' },
    step_1:        { title: 'Gathering Referrals',        content: 'We receive referrals from community members, schools, hospitals, volunteers, and direct applicants across Tamil Nadu.' },
    step_2:        { title: 'Verification',               content: 'Our team conducts telephonic checks followed by in-person field visits to confirm genuine need and assess the situation.' },
    step_3:        { title: 'Fund Raising',               content: 'Verified cases are shared with our donor network and members who contribute directly to the specific cause.' },
    step_4:        { title: 'Direct Payment & Monitoring',content: 'Funds are paid directly to institutions (schools, hospitals) with receipts. We continue to monitor each beneficiary\'s progress.' },
    detail_1:      { title: 'Case Intake',          content: 'Student or patient referred by community member, school, hospital, or direct application.' },
    detail_2:      { title: 'Contact Verification', content: 'Telephonic contact to verify information and initial assessment of the case.' },
    detail_3:      { title: 'Volunteer Engagement', content: 'Direct volunteer interaction with students and families to understand circumstances.' },
    detail_4:      { title: 'On-site Visit',         content: 'Field visit to confirm circumstances, gather academic records and supporting documents.' },
    detail_5:      { title: 'Funding Request',       content: 'Case details shared across donor network and FECT membership for contributions.' },
    detail_6:      { title: 'Direct Payment',        content: 'Donations collected and paid directly to the institution — receipts documented and shared.' },
    detail_7:      { title: 'Progress Update',       content: 'Donors receive updates about the student\'s academic progress via email or network.' },
    detail_8:      { title: 'Ongoing Monitoring',    content: 'Continuous academic monitoring with remedial support provided to students who struggle.' },
    homes_title:   { title: 'Support for Homes & Institutions' },
    homes_content: { content: 'For homes serving elderly, disabled, or orphaned individuals, FECT provides assistance 4–6 times annually. We identify genuinely struggling organisations, engage with management and residents, and create customised wish lists addressing provisions, medical needs, and activity materials.' },
  },
  who_we_are: {
    hero:           { title: 'Who We Are',       content: 'Engineers turned social workers — a team that chose purpose over profit.' },
    origin:         { title: 'How It All Began', content: 'FECT began as a group of computer engineering students who shared a common purpose beyond their studies. The founders initially pursued separate careers but later reunited with determination to establish an organisation dedicated to social impact. The group\'s philosophy centres on a straightforward principle: the best possible way to eliminate poverty is to inherit education to our younger generation.' },
    growth:         { title: 'Growth & Development', content: 'The organisation experienced significant challenges during its formation but persevered through collaborative support. The team gradually identified and assisted disadvantaged youth while expanding operations. The group was officially registered as Friends Educational and Charitable Trust (FECT) in February 2009 to formalise their charitable work.' },
    today:          { title: 'FECT Today',       content: 'Currently, the organisation comprises approximately 40 members from various professional backgrounds — committed to improving children\'s educational opportunities and life prospects. Together we have touched the lives of over 1,200 students and supported numerous care homes across Tamil Nadu.' },
    stat_founded:   { title: '2009',    content: 'Year Founded' },
    stat_members:   { title: '40+',     content: 'Active Members' },
    stat_students:  { title: '1,200+',  content: 'Students Supported' },
    stat_districts: { title: '12+',     content: 'Districts Covered' },
    value_1:        { title: 'Compassion',    content: 'We treat every beneficiary with dignity — behind every case is a human story that deserves our best.' },
    value_2:        { title: 'Community',     content: 'We believe in the collective power of ordinary people doing extraordinary things together.' },
    value_3:        { title: 'Commitment',    content: 'Our members have sustained this mission for over 15 years through consistent personal effort.' },
    value_4:        { title: 'On-the-ground', content: 'We do the field work ourselves — visiting families, schools, and homes rather than operating remotely.' },
  },
  what_you_can_do: {
    hero:           { title: 'What You Can Do',   content: 'There are many ways to make a difference — choose what suits you best and join the FECT family.' },
    intro:          { title: 'Every Action Counts', content: 'We understand that not everyone can contribute in the same way. Whether you have time, money, connections, or simply a social media account — there is a meaningful role for you at FECT. Here are five powerful ways you can help transform lives.' },
    refer_student:  { title: 'Refer a Student',   content: 'Know an academically promising child from a financially struggling family? Refer them to us and we will take care of their education — fees, books, uniforms, and more.' },
    refer_home:     { title: 'Refer a Home',       content: 'Know a local orphanage, elderly home, or care institution that needs support? Help us find organisations where we can extend our helping hands.' },
    donate:         { title: 'Donate',             content: 'Every rupee you donate goes directly to a student\'s fees, medical treatment, or care home supplies. We maintain full financial transparency with receipts shared for every disbursement.' },
    become_member:  { title: 'Become a Member',    content: 'Join our growing family of 40+ committed members. Members contribute monthly, quarterly, or annually and can participate in field visits, awareness drives, and events.' },
    spread_word:    { title: 'Spread the Word',    content: 'Even if you cannot contribute financially, your voice matters. Share our story with friends, family, and on social media — awareness is the first step to change.' },
  },
  refer_student: {
    hero:  { title: 'Refer a Student', content: 'Know a bright child held back by poverty? Help us find them — we\'ll take care of the rest.' },
    intro: { content: 'We are looking for academically good poor children or schools that have a cluster of financially struggling students. If you know such a student or school, please fill in this form and we will reach out within a few days.' },
  },
  refer_home: {
    hero:  { title: 'Refer a Home', content: 'Help us find organisations that need support — orphanages, elderly homes, and care institutions.' },
    intro: { content: 'We are happy to extend our helping hands to Homes which need financial assistance. If you know of any local organisations in need of funding or supplies such as provisions, clothing, and food items, please fill in this form and we will reach out.' },
  },
  become_a_member: {
    hero:        { title: 'Become a Member', content: 'Join 40+ committed individuals who are transforming lives across Tamil Nadu through consistent, compassionate support.' },
    intro:       { content: 'Becoming a member of FECT means you pledge a regular contribution — however small — towards the cause of education and care. Members are the backbone of our operations. Please fill in the form below and we will get in touch to complete the enrolment process.' },
    req_title:   { title: 'Membership Requirements' },
    req_content: { content: 'Members are required to promise a certain sum of money which can be made either monthly, quarterly, half-yearly, or yearly. Minimum contributions are: Monthly ₹100 · Quarterly ₹300 · Half-Yearly ₹500 · Yearly ₹1,000. Members also have the option to participate in field work activities.' },
  },
  spread_the_word: {
    hero:    { title: 'Spread the Word', content: 'Your voice can change lives. Help us reach more people who need support and more people who can give it.' },
    intro:   { content: 'Though we are very active on social media, we would have better coverage if each of you spoke to your group of friends and enhanced our efforts. Share our story, share our mission — and help us find the next student or home that needs our support.' },
    share_1: { title: 'Tell Your Friends',      content: 'A personal recommendation carries more weight than any ad. Tell the people in your life about FECT.' },
    share_2: { title: 'Share on Social Media',  content: 'Post about our work on Facebook, Instagram, or WhatsApp. Tag us and encourage your network to engage.' },
    share_3: { title: 'Refer Potential Donors', content: 'Know someone who might want to contribute? Connect them with us — we\'ll take it from there.' },
    share_4: { title: 'Spread in Communities',  content: 'Share in schools, religious gatherings, resident associations, or workplaces where people look for causes to support.' },
  },
}

const PAGE_KEY_MAP: Record<string, string> = {
  Home: 'home',
  'Our Story': 'our_story',
  'Our Services': 'our_services',
  'Our Mission': 'our_mission',
  'Our Work Process': 'our_work_process',
  'Who We Are': 'who_we_are',
  'What You Can Do': 'what_you_can_do',
  'Refer a Student': 'refer_student',
  'Refer a Home': 'refer_home',
  'Become a Member': 'become_a_member',
  'Spread the Word': 'spread_the_word',
  Gallery: 'gallery',
  Testimonials: 'testimonials',
  Contact: 'contact',
  Donate: 'donate',
}

export default function AdminPages() {
  const [data, setData] = useState<Record<string, PageContent>>({})
  const [saving, setSaving] = useState<string | null>(null)
  const [uploading, setUploading] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('Home')
  const tabs = Object.keys(SECTIONS)

  useEffect(() => {
    supabase.from('page_content').select('*').then(({ data: rows }) => {
      if (!rows) return
      const map: Record<string, PageContent> = {}
      rows.forEach(r => { map[`${r.page_key}.${r.section_key}`] = r })
      setData(map)
    })
  }, [])

  const update = (key: string, field: 'title' | 'content' | 'image_url', value: string) => {
    setData(d => ({ ...d, [key]: { ...(d[key] || {} as PageContent), [field]: value } }))
  }

  const uploadHeroImage = async (mapKey: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(mapKey)
    const ext = file.name.split('.').pop()
    const path = `headers/${mapKey.replace('.', '-')}-${Date.now()}.${ext}`
    const { error } = await supabase.storage.from('fect-uploads').upload(path, file, { upsert: true })
    if (error) { toast.error('Upload failed: ' + error.message); setUploading(null); return }
    const { data: { publicUrl } } = supabase.storage.from('fect-uploads').getPublicUrl(path)
    update(mapKey, 'image_url', publicUrl)
    setUploading(null)
    toast.success('Header image uploaded! Click Save to apply.')
    e.target.value = ''
  }

  const handleSave = async (pageTab: string, sectionKey: string) => {
    const pageKey = PAGE_KEY_MAP[pageTab]
    const mapKey = `${pageKey}.${sectionKey}`
    const item = data[mapKey]
    if (!item) return
    setSaving(mapKey)
    const { error } = await supabase.from('page_content').upsert(
      { page_key: pageKey, section_key: sectionKey, title: item.title || '', content: item.content || '', image_url: item.image_url || '', updated_at: new Date().toISOString() },
      { onConflict: 'page_key,section_key' }
    )
    setSaving(null)
    if (error) toast.error(error.message)
    else toast.success('Saved!')
  }

  const handleSaveAll = async (pageTab: string) => {
    const pageKey = PAGE_KEY_MAP[pageTab]
    setSaving(`${pageKey}.__all__`)
    const upserts = SECTIONS[pageTab].map(s => {
      const item = data[`${pageKey}.${s.key}`]
      return { page_key: pageKey, section_key: s.key, title: item?.title || '', content: item?.content || '', image_url: item?.image_url || '', updated_at: new Date().toISOString() }
    })
    const { error } = await supabase.from('page_content').upsert(upserts, { onConflict: 'page_key,section_key' })
    setSaving(null)
    if (error) toast.error(error.message)
    else toast.success(`All ${pageTab} content saved!`)
  }

  const handleLoadDefaults = async (pageTab: string) => {
    const pk = PAGE_KEY_MAP[pageTab]
    const defaults = PAGE_DEFAULTS[pk]
    if (!defaults) { toast.error('No defaults defined for this page'); return }
    setSaving(`${pk}.__defaults__`)
    const upserts = Object.entries(defaults).map(([sk, vals]) => ({
      page_key: pk,
      section_key: sk,
      title: vals.title || '',
      content: vals.content || '',
      image_url: '',
      updated_at: new Date().toISOString(),
    }))
    const { error } = await supabase.from('page_content').upsert(upserts, { onConflict: 'page_key,section_key' })
    setSaving(null)
    if (error) { toast.error(error.message); return }
    // Merge into local state
    setData(prev => {
      const next = { ...prev }
      upserts.forEach(u => {
        const mk = `${u.page_key}.${u.section_key}`
        next[mk] = { ...next[mk], title: u.title, content: u.content } as PageContent
      })
      return next
    })
    toast.success(`Default content loaded for ${pageTab}!`)
  }

  const sections = SECTIONS[activeTab] || []
  const pageKey = PAGE_KEY_MAP[activeTab]

  return (
    <div>
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Page Content</h1>
          <p className="text-gray-500 text-sm">Edit every text section across all website pages</p>
        </div>
        <div className="flex items-center gap-2">
          {PAGE_DEFAULTS[pageKey] && (
            <button
              onClick={() => handleLoadDefaults(activeTab)}
              disabled={saving === `${pageKey}.__defaults__`}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-semibold text-sm hover:border-gray-400 disabled:opacity-60"
            >
              <RefreshCw size={15} />
              {saving === `${pageKey}.__defaults__` ? 'Loading…' : 'Load Defaults'}
            </button>
          )}
          <button
            onClick={() => handleSaveAll(activeTab)}
            disabled={saving === `${pageKey}.__all__`}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-white font-semibold disabled:opacity-60"
            style={{ backgroundColor: 'var(--site-primary)' }}
          >
            <Save size={16} />
            {saving === `${pageKey}.__all__` ? 'Saving...' : `Save All ${activeTab}`}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              activeTab === tab ? 'text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-400'
            }`}
            style={activeTab === tab ? { backgroundColor: 'var(--site-primary)' } : {}}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Sections */}
      <div className="space-y-4">
        {sections.map(section => {
          const mapKey = `${pageKey}.${section.key}`
          const item = data[mapKey] || { title: '', content: '' } as PageContent
          const isSaving = saving === mapKey
          const showTitle   = section.titleLabel !== ''
          const showContent = section.contentLabel !== ''

          return (
            <div key={section.key} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900 text-sm">{section.label}</h3>
                <button
                  onClick={() => handleSave(activeTab, section.key)}
                  disabled={isSaving}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-white text-xs font-semibold disabled:opacity-60"
                  style={{ backgroundColor: 'var(--site-primary)' }}
                >
                  <Save size={12} /> {isSaving ? 'Saving…' : 'Save'}
                </button>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                {showTitle && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">
                      {section.titleLabel || 'Title'}
                    </label>
                    <input
                      value={item.title || ''}
                      onChange={e => update(mapKey, 'title', e.target.value)}
                      className="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:outline-none text-gray-800 text-sm"
                    />
                  </div>
                )}
                {showContent && (
                  <div className={!showTitle ? 'sm:col-span-2' : ''}>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">
                      {section.contentLabel || 'Content'}
                    </label>
                    <textarea
                      value={item.content || ''}
                      onChange={e => update(mapKey, 'content', e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:outline-none text-gray-800 text-sm resize-none"
                    />
                  </div>
                )}

                {/* Header / banner background image */}
                {section.image && (
                  <div className="sm:col-span-2">
                    <label className="text-xs font-semibold text-gray-500 mb-1.5 flex items-center gap-1.5">
                      <ImageIcon size={13} /> Header Background Image
                    </label>
                    <div className="flex flex-col sm:flex-row gap-3">
                      {/* Preview */}
                      <div
                        className="w-full sm:w-44 h-24 rounded-lg bg-cover bg-center border border-gray-200 shrink-0 flex items-center justify-center text-xs text-gray-400 relative overflow-hidden"
                        style={item.image_url ? { backgroundImage: `url(${item.image_url})` } : {}}
                      >
                        {!item.image_url && 'Default image'}
                        {item.image_url && <div className="absolute inset-0 bg-black/30" />}
                      </div>
                      <div className="flex-1 space-y-2">
                        <label className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border-2 border-dashed cursor-pointer text-sm font-medium transition-colors ${uploading === mapKey ? 'opacity-60' : 'border-gray-300 text-gray-500 hover:border-[var(--site-primary)] hover:text-[var(--site-primary)]'}`}>
                          {uploading === mapKey ? (
                            <><div className="w-4 h-4 rounded-full border-2 border-gray-300 border-t-[var(--site-primary)] animate-spin" /> Uploading…</>
                          ) : (
                            <><Upload size={14} /> Upload image</>
                          )}
                          <input type="file" accept="image/*" className="hidden" onChange={e => uploadHeroImage(mapKey, e)} disabled={uploading === mapKey} />
                        </label>
                        <input
                          value={item.image_url || ''}
                          onChange={e => update(mapKey, 'image_url', e.target.value)}
                          placeholder="…or paste an image URL"
                          className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none text-gray-800 text-xs"
                        />
                        {item.image_url && (
                          <button
                            type="button"
                            onClick={() => update(mapKey, 'image_url', '')}
                            className="text-xs text-red-500 hover:underline"
                          >
                            Remove (use default)
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
