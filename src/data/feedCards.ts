import { FeedCard } from '@/types/FeedCard';

export const feedCards: FeedCard[] = [
  {
    id: '1',
    image_url: 'https://i.pinimg.com/1200x/e5/7d/50/e57d509746579cd54b6cb4c6df97dc5e.jpg',
    title: 'Understanding Autism Spectrum Disorder: A Comprehensive Guide',
    user_id: 'user1',
    user_name: 'Dr. Sarah Johnson',
    date: 'Dec 15, 2024',
    read_time: '15 min read',
    tags: ['Medicine', 'Therapy', 'Daily Routine'],
    price: 29.99,
    html_content: `
      <div class="prose max-w-none">
        <h1 class="text-3xl font-bold text-gray-900 mb-6">Understanding Autism Spectrum Disorder: A Comprehensive Guide</h1>
        
        <div class="mb-8">
          <img src="https://i.pinimg.com/1200x/e5/7d/50/e57d509746579cd54b6cb4c6df97dc5e.jpg" alt="Autism Awareness" class="w-full h-64 object-cover rounded-lg mb-6" />
        </div>
        
        <p class="text-lg text-gray-700 mb-6">
          Autism Spectrum Disorder (ASD) is a complex developmental condition that affects how a person perceives and socializes with others, causing problems in social interaction and communication. The disorder also includes limited and repetitive patterns of behavior.
        </p>
        
        <h2 class="text-2xl font-semibold text-gray-800 mb-4">What is Autism Spectrum Disorder?</h2>
        <p class="text-gray-700 mb-6">
          Autism spectrum disorder is a condition related to brain development that impacts how a person perceives and socializes with others, causing problems in social interaction and communication. The disorder also includes limited and repetitive patterns of behavior.
        </p>
        
        <h2 class="text-2xl font-semibold text-gray-800 mb-4">Early Signs and Symptoms</h2>
        <ul class="list-disc pl-6 mb-6 text-gray-700">
          <li>Delayed speech and language skills</li>
          <li>Repetitive behaviors (flapping, rocking, spinning)</li>
          <li>Unusual responses to sensory input</li>
          <li>Difficulty with social interactions</li>
          <li>Intense focus on specific interests</li>
        </ul>
        
        <h2 class="text-2xl font-semibold text-gray-800 mb-4">Treatment and Support</h2>
        <p class="text-gray-700 mb-6">
          Early intervention is crucial for children with ASD. Treatment typically involves a combination of behavioral therapy, speech therapy, occupational therapy, and educational support. Each child's treatment plan should be individualized to address their specific needs.
        </p>
        
        <div class="bg-blue-50 p-6 rounded-lg mb-6">
          <h3 class="text-xl font-semibold text-blue-800 mb-3">Key Takeaways</h3>
          <ul class="text-blue-700">
            <li>ASD affects each person differently</li>
            <li>Early diagnosis and intervention are crucial</li>
            <li>Support should be individualized</li>
            <li>Family involvement is essential</li>
          </ul>
        </div>
      </div>
    `,
    allow_comments: true,
    tier: 'premium',
    collection: 'autism-resources',
    attachments: [],
    date_published: '2024-12-15'
  },
  {
    id: '2',
    image_url: 'https://i.pinimg.com/1200x/e4/98/ed/e498ed74c4fa4df2290230c896eec488.jpg',
    title: 'Speech Therapy Techniques for Non-Verbal Children',
    user_id: 'user2',
    user_name: 'Dr. Michael Chen',
    date: 'Dec 12, 2024',
    read_time: '12 min read',
    tags: ['Communication', 'Therapy', 'Development'],
    price: 24.99,
    html_content: `
      <div class="prose max-w-none">
        <h1 class="text-3xl font-bold text-gray-900 mb-6">Speech Therapy Techniques for Non-Verbal Children</h1>
        
        <div class="mb-8">
          <img src="https://i.pinimg.com/1200x/e4/98/ed/e498ed74c4fa4df2290230c896eec488.jpg" alt="Speech Therapy" class="w-full h-64 object-cover rounded-lg mb-6" />
        </div>
        
        <p class="text-lg text-gray-700 mb-6">
          Speech therapy for non-verbal children involves specialized techniques to help develop communication skills. This comprehensive guide covers evidence-based approaches that speech therapists use to support children who are non-verbal or have limited speech.
        </p>
        
        <h2 class="text-2xl font-semibold text-gray-800 mb-4">Understanding Non-Verbal Communication</h2>
        <p class="text-gray-700 mb-6">
          Non-verbal children often communicate through gestures, facial expressions, and body language. Understanding these communication methods is the first step in developing effective speech therapy strategies.
        </p>
        
        <h2 class="text-2xl font-semibold text-gray-800 mb-4">Effective Techniques</h2>
        <ul class="list-disc pl-6 mb-6 text-gray-700">
          <li>Picture Exchange Communication System (PECS)</li>
          <li>Sign language integration</li>
          <li>Augmentative and Alternative Communication (AAC)</li>
          <li>Play-based therapy approaches</li>
          <li>Technology-assisted communication</li>
        </ul>
        
        <h2 class="text-2xl font-semibold text-gray-800 mb-4">Home Practice Strategies</h2>
        <p class="text-gray-700 mb-6">
          Parents and caregivers play a crucial role in supporting speech development. Regular practice at home, consistent routines, and creating communication opportunities throughout the day are essential for progress.
        </p>
        
        <div class="bg-green-50 p-6 rounded-lg mb-6">
          <h3 class="text-xl font-semibold text-green-800 mb-3">Key Strategies</h3>
          <ul class="text-green-700">
            <li>Use visual supports consistently</li>
            <li>Create communication opportunities</li>
            <li>Model language frequently</li>
            <li>Celebrate all communication attempts</li>
          </ul>
        </div>
      </div>
    `,
    allow_comments: true,
    tier: 'standard',
    collection: 'speech-therapy',
    attachments: [],
    date_published: '2024-12-12'
  },
  {
    id: '3',
    image_url: 'https://i.pinimg.com/1200x/18/30/12/1830124b24ee943cc8c4632bd5b5b838.jpg',
    title: 'Sensory Processing Strategies for Home Environment',
    user_id: 'user3',
    user_name: 'Dr. Emily Rodriguez',
    date: 'Dec 10, 2024',
    read_time: '18 min read',
    tags: ['Sensory', 'Home Care', 'Environment'],
    price: 34.99,
    html_content: `
      <div class="prose max-w-none">
        <h1 class="text-3xl font-bold text-gray-900 mb-6">Sensory Processing Strategies for Home Environment</h1>
        
        <div class="mb-8">
          <img src="https://i.pinimg.com/1200x/18/30/12/1830124b24ee943cc8c4632bd5b5b838.jpg" alt="Sensory Processing" class="w-full h-64 object-cover rounded-lg mb-6" />
        </div>
        
        <p class="text-lg text-gray-700 mb-6">
          Creating a sensory-friendly home environment is crucial for children with sensory processing difficulties. This guide provides practical strategies to help parents and caregivers create supportive spaces that meet their child's unique sensory needs.
        </p>
        
        <h2 class="text-2xl font-semibold text-gray-800 mb-4">Understanding Sensory Processing</h2>
        <p class="text-gray-700 mb-6">
          Sensory processing refers to how the nervous system receives, organizes, and responds to sensory information from the environment. Children with sensory processing difficulties may be over-responsive or under-responsive to various stimuli.
        </p>
        
        <h2 class="text-2xl font-semibold text-gray-800 mb-4">Home Environment Strategies</h2>
        <ul class="list-disc pl-6 mb-6 text-gray-700">
          <li>Create quiet spaces for retreat</li>
          <li>Use soft, natural lighting</li>
          <li>Provide sensory tools and fidgets</li>
          <li>Organize spaces with clear visual boundaries</li>
          <li>Consider texture and material choices</li>
        </ul>
        
        <h2 class="text-2xl font-semibold text-gray-800 mb-4">Room-by-Room Adaptations</h2>
        <p class="text-gray-700 mb-6">
          Each room in your home can be adapted to support sensory needs. From the bedroom to the kitchen, learn how to create environments that promote comfort and reduce sensory overload.
        </p>
        
        <div class="bg-purple-50 p-6 rounded-lg mb-6">
          <h3 class="text-xl font-semibold text-purple-800 mb-3">Key Principles</h3>
          <ul class="text-purple-700">
            <li>Respect individual sensory preferences</li>
            <li>Provide choices and control</li>
            <li>Create predictable routines</li>
            <li>Allow for sensory breaks</li>
          </ul>
        </div>
      </div>
    `,
    allow_comments: true,
    tier: 'premium',
    collection: 'sensory-processing',
    attachments: [],
    date_published: '2024-12-10'
  },
  {
    id: '4',
    image_url: 'https://i.pinimg.com/736x/af/e8/82/afe882745b8cdc126a368578465f9965.jpg',
    title: 'Behavioral Intervention Plans: A Parent\'s Guide',
    user_id: 'user4',
    user_name: 'Dr. James Wilson',
    date: 'Dec 8, 2024',
    read_time: '22 min read',
    tags: ['Behavior', 'Intervention', 'Parenting'],
    price: 39.99,
    html_content: `
      <div class="prose max-w-none">
        <h1 class="text-3xl font-bold text-gray-900 mb-6">Behavioral Intervention Plans: A Parent\'s Guide</h1>
        
        <div class="mb-8">
          <img src="https://i.pinimg.com/736x/af/e8/82/afe882745b8cdc126a368578465f9965.jpg" alt="Behavioral Intervention" class="w-full h-64 object-cover rounded-lg mb-6" />
        </div>
        
        <p class="text-lg text-gray-700 mb-6">
          Behavioral intervention plans (BIPs) are structured approaches to addressing challenging behaviors in children. This comprehensive guide helps parents understand how to develop and implement effective behavioral strategies at home.
        </p>
        
        <h2 class="text-2xl font-semibold text-gray-800 mb-4">Understanding Challenging Behaviors</h2>
        <p class="text-gray-700 mb-6">
          Challenging behaviors often serve a function for the child, such as gaining attention, avoiding tasks, or seeking sensory input. Understanding the function of behavior is the first step in developing effective interventions.
        </p>
        
        <h2 class="text-2xl font-semibold text-gray-800 mb-4">Components of a BIP</h2>
        <ul class="list-disc pl-6 mb-6 text-gray-700">
          <li>Functional behavior assessment</li>
          <li>Prevention strategies</li>
          <li>Replacement behaviors</li>
          <li>Consequence strategies</li>
          <li>Data collection and monitoring</li>
        </ul>
        
        <h2 class="text-2xl font-semibold text-gray-800 mb-4">Implementation Strategies</h2>
        <p class="text-gray-700 mb-6">
          Successful implementation requires consistency, patience, and collaboration between all caregivers. Regular monitoring and adjustment of strategies ensures continued effectiveness.
        </p>
        
        <div class="bg-red-50 p-6 rounded-lg mb-6">
          <h3 class="text-xl font-semibold text-red-800 mb-3">Success Tips</h3>
          <ul class="text-red-700">
            <li>Be consistent across all environments</li>
            <li>Focus on positive reinforcement</li>
            <li>Monitor progress regularly</li>
            <li>Adjust strategies as needed</li>
          </ul>
        </div>
      </div>
    `,
    allow_comments: true,
    tier: 'premium',
    collection: 'behavioral-intervention',
    attachments: [],
    date_published: '2024-12-08'
  },
  {
    id: '5',
    image_url: 'https://i.pinimg.com/736x/d7/d7/d7/d7d7d7d663ccadc1ddb123dad18c1b6e.jpg',
    title: 'Fine Motor Skills Development in Early Childhood',
    user_id: 'user5',
    user_name: 'Dr. Lisa Thompson',
    date: 'Dec 6, 2024',
    read_time: '14 min read',
    tags: ['Motor Skills', 'Development', 'Early Childhood'],
    price: 27.99,
    html_content: `
      <div class="prose max-w-none">
        <h1 class="text-3xl font-bold text-gray-900 mb-6">Fine Motor Skills Development in Early Childhood</h1>
        
        <div class="mb-8">
          <img src="https://i.pinimg.com/736x/d7/d7/d7/d7d7d7d663ccadc1ddb123dad18c1b6e.jpg" alt="Fine Motor Skills" class="w-full h-64 object-cover rounded-lg mb-6" />
        </div>
        
        <p class="text-lg text-gray-700 mb-6">
          Fine motor skills involve the coordination of small muscles in the hands and fingers. These skills are essential for daily activities like writing, dressing, and feeding. This guide provides strategies to support fine motor development in young children.
        </p>
        
        <h2 class="text-2xl font-semibold text-gray-800 mb-4">Developmental Milestones</h2>
        <p class="text-gray-700 mb-6">
          Understanding typical fine motor development helps identify when children may need additional support. Milestones vary, but there are general expectations for different age ranges.
        </p>
        
        <h2 class="text-2xl font-semibold text-gray-800 mb-4">Activities to Promote Development</h2>
        <ul class="list-disc pl-6 mb-6 text-gray-700">
          <li>Play with building blocks and puzzles</li>
          <li>Drawing and coloring activities</li>
          <li>Stringing beads and threading</li>
          <li>Using scissors and glue</li>
          <li>Play dough and clay activities</li>
        </ul>
        
        <h2 class="text-2xl font-semibold text-gray-800 mb-4">When to Seek Help</h2>
        <p class="text-gray-700 mb-6">
          If you notice significant delays in fine motor development, consult with a pediatrician or occupational therapist. Early intervention can make a significant difference in a child's development.
        </p>
        
        <div class="bg-yellow-50 p-6 rounded-lg mb-6">
          <h3 class="text-xl font-semibold text-yellow-800 mb-3">Development Tips</h3>
          <ul class="text-yellow-700">
            <li>Provide age-appropriate activities</li>
            <li>Encourage independence</li>
            <li>Make activities fun and engaging</li>
            <li>Celebrate small achievements</li>
          </ul>
        </div>
      </div>
    `,
    allow_comments: true,
    tier: 'standard',
    collection: 'motor-skills',
    attachments: [],
    date_published: '2024-12-06'
  },
  {
    id: '6',
    image_url: 'https://i.pinimg.com/1200x/c3/01/2f/c3012f6e016482f3ae3227b65abf882d.jpg',
    title: 'Social Skills Training for Children with ASD',
    user_id: 'user6',
    user_name: 'Dr. Robert Davis',
    date: 'Dec 4, 2024',
    read_time: '20 min read',
    tags: ['Social Skills', 'Training', 'ASD'],
    price: 32.99,
    html_content: `
      <div class="prose max-w-none">
        <h1 class="text-3xl font-bold text-gray-900 mb-6">Social Skills Training for Children with ASD</h1>
        
        <div class="mb-8">
          <img src="https://i.pinimg.com/1200x/c3/01/2f/c3012f6e016482f3ae3227b65abf882d.jpg" alt="Social Skills Training" class="w-full h-64 object-cover rounded-lg mb-6" />
        </div>
        
        <p class="text-lg text-gray-700 mb-6">
          Social skills training is essential for children with Autism Spectrum Disorder (ASD) to develop meaningful relationships and navigate social situations effectively. This guide provides evidence-based strategies for teaching social skills.
        </p>
        
        <h2 class="text-2xl font-semibold text-gray-800 mb-4">Core Social Skills</h2>
        <p class="text-gray-700 mb-6">
          Key social skills include making eye contact, taking turns in conversation, understanding emotions, and reading social cues. Each skill can be broken down into teachable components.
        </p>
        
        <h2 class="text-2xl font-semibold text-gray-800 mb-4">Teaching Strategies</h2>
        <ul class="list-disc pl-6 mb-6 text-gray-700">
          <li>Social stories and scripts</li>
          <li>Role-playing activities</li>
          <li>Video modeling</li>
          <li>Peer-mediated interventions</li>
          <li>Group therapy sessions</li>
        </ul>
        
        <h2 class="text-2xl font-semibold text-gray-800 mb-4">Home Practice</h2>
        <p class="text-gray-700 mb-6">
          Parents can support social skills development through daily interactions, structured play dates, and consistent reinforcement of learned skills in natural settings.
        </p>
        
        <div class="bg-teal-50 p-6 rounded-lg mb-6">
          <h3 class="text-xl font-semibold text-teal-800 mb-3">Practice Tips</h3>
          <ul class="text-teal-700">
            <li>Start with simple skills</li>
            <li>Use visual supports</li>
            <li>Provide immediate feedback</li>
            <li>Practice in natural settings</li>
          </ul>
        </div>
      </div>
    `,
    allow_comments: true,
    tier: 'premium',
    collection: 'social-skills',
    attachments: [],
    date_published: '2024-12-04'
  },
  {
    id: '7',
    image_url: 'https://i.pinimg.com/1200x/5a/94/66/5a946614032f6485a32505b74c64a4b6.jpg',
    title: 'Nutrition and Feeding Strategies for Picky Eaters',
    user_id: 'user7',
    user_name: 'Dr. Amanda Foster',
    date: 'Dec 2, 2024',
    read_time: '16 min read',
    tags: ['Nutrition', 'Feeding', 'Health'],
    price: 26.99,
    html_content: `
      <div class="prose max-w-none">
        <h1 class="text-3xl font-bold text-gray-900 mb-6">Nutrition and Feeding Strategies for Picky Eaters</h1>
        
        <div class="mb-8">
          <img src="https://i.pinimg.com/1200x/5a/94/66/5a946614032f6485a32505b74c64a4b6.jpg" alt="Nutrition and Feeding" class="w-full h-64 object-cover rounded-lg mb-6" />
        </div>
        
        <p class="text-lg text-gray-700 mb-6">
          Picky eating is a common challenge for many families, especially those with children who have special needs. This guide provides practical strategies to encourage healthy eating habits and expand food preferences.
        </p>
        
        <h2 class="text-2xl font-semibold text-gray-800 mb-4">Understanding Picky Eating</h2>
        <p class="text-gray-700 mb-6">
          Picky eating can stem from sensory sensitivities, anxiety, or developmental factors. Understanding the underlying causes helps develop appropriate strategies for each child.
        </p>
        
        <h2 class="text-2xl font-semibold text-gray-800 mb-4">Effective Strategies</h2>
        <ul class="list-disc pl-6 mb-6 text-gray-700">
          <li>Offer new foods repeatedly</li>
          <li>Make mealtimes positive</li>
          <li>Involve children in food preparation</li>
          <li>Use visual supports and schedules</li>
          <li>Respect food preferences and aversions</li>
        </ul>
        
        <h2 class="text-2xl font-semibold text-gray-800 mb-4">Nutritional Considerations</h2>
        <p class="text-gray-700 mb-6">
          Ensuring adequate nutrition while respecting food preferences requires creativity and patience. Focus on nutrient-dense foods and consider supplements when necessary.
        </p>
        
        <div class="bg-green-50 p-6 rounded-lg mb-6">
          <h3 class="text-xl font-semibold text-green-800 mb-3">Mealtime Tips</h3>
          <ul class="text-green-700">
            <li>Create a positive atmosphere</li>
            <li>Offer choices within limits</li>
            <li>Model healthy eating</li>
            <li>Be patient with progress</li>
          </ul>
        </div>
      </div>
    `,
    allow_comments: true,
    tier: 'standard',
    collection: 'nutrition',
    attachments: [],
    date_published: '2024-12-02'
  },
  {
    id: '8',
    image_url: 'https://i.pinimg.com/1200x/3a/1f/aa/3a1faaeb334aa5eeb67229f2f06b62cc.jpg',
    title: 'Sleep Training Methods for Children with Special Needs',
    user_id: 'user8',
    user_name: 'Dr. Patricia Martinez',
    date: 'Nov 30, 2024',
    read_time: '19 min read',
    tags: ['Sleep', 'Training', 'Special Needs'],
    price: 31.99,
    html_content: `
      <div class="prose max-w-none">
        <h1 class="text-3xl font-bold text-gray-900 mb-6">Sleep Training Methods for Children with Special Needs</h1>
        
        <div class="mb-8">
          <img src="https://i.pinimg.com/1200x/3a/1f/aa/3a1faaeb334aa5eeb67229f2f06b62cc.jpg" alt="Sleep Training" class="w-full h-64 object-cover rounded-lg mb-6" />
        </div>
        
        <p class="text-lg text-gray-700 mb-6">
          Sleep difficulties are common among children with special needs. This guide provides evidence-based strategies to help establish healthy sleep patterns and improve overall well-being for the entire family.
        </p>
        
        <h2 class="text-2xl font-semibold text-gray-800 mb-4">Understanding Sleep Challenges</h2>
        <p class="text-gray-700 mb-6">
          Children with special needs may experience sleep difficulties due to sensory sensitivities, anxiety, medication side effects, or underlying medical conditions. Understanding the root cause is essential for effective intervention.
        </p>
        
        <h2 class="text-2xl font-semibold text-gray-800 mb-4">Sleep Environment Optimization</h2>
        <ul class="list-disc pl-6 mb-6 text-gray-700">
          <li>Create a calming bedtime routine</li>
          <li>Optimize bedroom environment</li>
          <li>Use appropriate bedding and pajamas</li>
          <li>Consider white noise or music</li>
          <li>Address sensory needs</li>
        </ul>
        
        <h2 class="text-2xl font-semibold text-gray-800 mb-4">Behavioral Strategies</h2>
        <p class="text-gray-700 mb-6">
          Gradual approaches to sleep training, such as fading and camping out, can be effective for children with special needs. Consistency and patience are key to success.
        </p>
        
        <div class="bg-indigo-50 p-6 rounded-lg mb-6">
          <h3 class="text-xl font-semibold text-indigo-800 mb-3">Sleep Tips</h3>
          <ul class="text-indigo-700">
            <li>Maintain consistent routines</li>
            <li>Address underlying issues</li>
            <li>Use visual schedules</li>
            <li>Seek professional help when needed</li>
          </ul>
        </div>
      </div>
    `,
    allow_comments: true,
    tier: 'premium',
    collection: 'sleep-training',
    attachments: [],
    date_published: '2024-11-30'
  }
]; 