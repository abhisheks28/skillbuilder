import random
import math

def get_random_int(min_val, max_val):
    return random.randint(min_val, max_val)

def shuffle_array(arr):
    random.shuffle(arr)
    return arr

# --- Large Numbers ---

def generatePlaceValueLarge():
    number = get_random_int(1000000, 99999999)
    str_num = str(number)
    # Pick a random digit (avoid leading 0 notion, though string index is fine)
    idx = get_random_int(0, len(str_num) - 1)
    digit = str_num[idx]
    
    # Places from right: 0=ones, 1=tens, etc.
    power = len(str_num) - 1 - idx
    place_names = ["Ones", "Tens", "Hundreds", "Thousands", "Ten Thousands", "Lakhs", "Ten Lakhs", "Crores"]
    
    if power < len(place_names):
        correct_place = place_names[power]
    else:
        correct_place = "Unknown" # Fallback
        
    question = f"What is the place value of <b>{digit}</b> in the number <b>{number:,}</b>?"
    
    # Generate options
    options = [correct_place]
    while len(options) < 4:
        p = random.choice(place_names)
        if p not in options:
            options.append(p)
            
    random.shuffle(options)
    
    formatted_options = [{"value": opt, "label": opt} for opt in options]
    
    return {
        "type": "mcq",
        "question": question,
        "topic": "Large Numbers / Place Value",
        "options": formatted_options,
        "answer": correct_place
    }

def generateCompareLarge():
    n1 = get_random_int(1000000, 9999999)
    n2 = get_random_int(1000000, 9999999)
    while n1 == n2:
        n2 = get_random_int(1000000, 9999999)
        
    question = f"Compare the numbers: <b>{n1:,}</b> and <b>{n2:,}</b>"
    
    if n1 > n2:
        answer = ">"
    else:
        answer = "<"
        
    options = [
        {"value": ">", "label": "> (Greater than)"},
        {"value": "<", "label": "< (Less than)"},
        {"value": "=", "label": "= (Equal to)"}
    ]
    
    return {
        "type": "mcq",
        "question": question,
        "topic": "Large Numbers / Compare",
        "options": options,
        "answer": answer
    }

def generateExpandedForm():
    number = get_random_int(10000, 99999)
    str_num = str(number)
    parts = []
    for i, digit in enumerate(str_num):
        val = int(digit) * (10 ** (len(str_num) - 1 - i))
        if val > 0:
            parts.append(f"{val}")
            
    answer = " + ".join(parts)
    
    # Distractors
    distractors = []
    # 1. Wrong power
    distractors.append(" + ".join([f"{int(d)}00" for d in str_num]))
    # 2. Just digits
    distractors.append(" + ".join(list(str_num)))
    # 3. Random mix
    distractors.append(" + ".join([str(get_random_int(100, 9000)) for _ in parts]))

    # Ensure uniqueness and 4 options
    final_options = [answer]
    for d in distractors:
        if d not in final_options:
            final_options.append(d)
            
    while len(final_options) < 4:
        final_options.append(f"{get_random_int(10000, 99999)}")
        
    random.shuffle(final_options)
    formatted_options = [{"value": o, "label": o} for o in final_options]

    return {
        "type": "mcq",
        "question": f"What is the expanded form of <b>{number:,}</b>?",
        "topic": "Large Numbers / Expanded Form",
        "options": formatted_options,
        "answer": answer
    }

# --- Operations ---

def generateAdditionLarge():
    n1 = get_random_int(10000, 99999)
    n2 = get_random_int(10000, 99999)
    answer = n1 + n2
    return {
        "type": "userInput",
        "question": f"Add the following numbers:<br/>{n1:,} + {n2:,} = ?",
        "topic": "Operations / Addition",
        "answer": str(answer)
    }

def generateSubtractionLarge():
    n1 = get_random_int(50000, 99999)
    n2 = get_random_int(10000, 49999)
    answer = n1 - n2
    return {
        "type": "userInput",
        "question": f"Subtract:<br/>{n1:,} - {n2:,} = ?",
        "topic": "Operations / Subtraction",
        "answer": str(answer)
    }

def generateMultiplicationLarge():
    n1 = get_random_int(100, 999)
    n2 = get_random_int(10, 99)
    answer = n1 * n2
    return {
        "type": "userInput",
        "question": f"Multiply:<br/>{n1} × {n2} = ?",
        "topic": "Operations / Multiplication",
        "answer": str(answer)
    }

def generateDivisionLarge():
    n2 = get_random_int(2, 20)
    quotient = get_random_int(100, 500)
    n1 = n2 * quotient # Ensure perfect division for simplicity or handle remainder
    # Let's verify remainder logic. Grade 5 usually handles remainders. 
    # For now, let's keep it exact or specify "Find the quotient"
    answer = str(quotient)
    return {
        "type": "userInput",
        "question": f"Divide:<br/>{n1} ÷ {n2} = ?",
        "topic": "Operations / Division",
        "answer": answer
    }

def generateEstimationOps():
    # Estimate sum by rounding to nearest 1000
    n1 = get_random_int(1100, 9900)
    n2 = get_random_int(1100, 9900)
    
    r1 = round(n1, -3)
    r2 = round(n2, -3)
    estimated_sum = r1 + r2
    
    question = f"Estimate the sum by rounding to the nearest thousand:<br/>{n1} + {n2}"
    
    return {
        "type": "userInput",
        "question": question,
        "topic": "Operations / Estimation",
        "answer": str(estimated_sum)
    }

# --- Fractions ---

def generateEquivalentFractions():
    num = get_random_int(1, 5)
    den = get_random_int(num + 1, 10)
    factor = get_random_int(2, 5)
    
    eq_num = num * factor
    eq_den = den * factor
    
    question = f"Find the missing number to make equivalent fractions:<br/>{num}/{den} = ?/{eq_den}"
    
    return {
        "type": "userInput",
        "question": question,
        "topic": "Fractions / Equivalent",
        "answer": str(eq_num)
    }

def generateSimplifyFractions():
    common = get_random_int(2, 6)
    simp_num = get_random_int(1, 5)
    simp_den = get_random_int(simp_num + 1, 10)
    
    num = simp_num * common
    den = simp_den * common
    
    answer = f"{simp_num}/{simp_den}"
    
    # We'll ask for MCQs usually for simplification to avoid formatting issues
    options = [answer]
    # Distractors
    options.append(f"{num}/{den}") # The original
    options.append(f"{simp_den}/{simp_num}") # Inverted
    options.append(f"{simp_num + 1}/{simp_den + 1}") # Random
    
    random.shuffle(options)
    formatted_options = [{"value": o, "label": o} for o in options]
    
    return {
        "type": "mcq",
        "question": f"Simplify the fraction to its lowest terms: {num}/{den}",
        "topic": "Fractions / Simplify",
        "options": formatted_options,
        "answer": answer
    }

def generateAddUnlikeFractions():
    # Simple unlike fractions, e.g., denom 2 and 4, or 3 and 6
    d1 = get_random_int(2, 5)
    d2 = d1 * get_random_int(2, 3) # ensure d2 is multiple of d1 for ease
    
    n1 = 1
    n2 = 1
    
    # n1/d1 + n2/d2
    # Convert n1/d1 to (n1*(d2/d1))/d2
    equiv_n1 = n1 * (d2 // d1)
    total_num = equiv_n1 + n2
    
    # simplify result if possible (optional, but let's check basic cases)
    # For Grade 5, maybe just asking for the numerator over d2 is risky if it simplifies.
    # Let's stick to MCQ to provide the simplified or expected form.
    
    ans_num = total_num
    ans_den = d2
    
    # Simple simplification
    gcd = math.gcd(ans_num, ans_den)
    ans_num //= gcd
    ans_den //= gcd
    
    answer = f"{ans_num}/{ans_den}"
    
    options = set()
    options.add(answer)
    while len(options) < 4:
        f_n = get_random_int(1, 10)
        f_d = get_random_int(2, 12)
        options.add(f"{f_n}/{f_d}")
        
    options = list(options)
    random.shuffle(options)
    formatted_options = [{"value": o, "label": o} for o in options]
    
    return {
        "type": "mcq",
        "question": f"Add the fractions: 1/{d1} + 1/{d2} = ?",
        "topic": "Fractions / Addition",
        "options": formatted_options,
        "answer": answer
    }

# --- Decimals ---

def generateDecimalPlaceValue():
    num = round(random.uniform(1, 99), 3)
    str_num = f"{num:.3f}"
    # Target a digit after decimal
    digit_idx = get_random_int(0, 2) # 0=tenths, 1=hundredths, 2=thousandths
    parts = str_num.split('.')
    if len(parts) < 2 or len(parts[1]) <= digit_idx: 
        # Fallback if rng gives short decimal
        str_num = "12.345"
        parts = str_num.split('.')
        
    target_digit = parts[1][digit_idx]
    
    places = ["Tenths", "Hundredths", "Thousandths"]
    correct = places[digit_idx]
    
    return {
        "type": "mcq",
        "question": f"What is the place value of <b>{target_digit}</b> in {str_num}?",
        "topic": "Decimals / Place Value",
        "options": [{"value": p, "label": p} for p in places] + [{"value": "Ones", "label": "Ones"}],
        "answer": correct
    }

def generateDecimalOps():
    op = random.choice(['+', '-', '*'])
    n1 = round(random.uniform(1, 20), 1)
    n2 = round(random.uniform(1, 10), 1)
    
    if op == '+':
        ans = n1 + n2
        q = f"{n1} + {n2}"
    elif op == '-':
        if n1 < n2: n1, n2 = n2, n1
        ans = n1 - n2
        q = f"{n1} - {n2}"
    else:
        # Simple mult
        n2 = get_random_int(2, 5) # integer mult for easier mental math
        ans = n1 * n2
        q = f"{n1} × {n2}"
        
    ans = round(ans, 2)
    return {
        "type": "userInput",
        "question": f"Solve: {q} = ?",
        "topic": "Decimals / Operations",
        "answer": str(ans)
    }

def generateUnitConversion():
    conversions = [
        ("km", "m", 1000),
        ("kg", "g", 1000),
        ("L", "mL", 1000),
        ("m", "cm", 100)
    ]
    unit_from, unit_to, factor = random.choice(conversions)
    val = get_random_int(2, 15)
    ans = val * factor
    
    return {
        "type": "userInput",
        "question": f"Convert: {val} {unit_from} = ____ {unit_to}",
        "topic": "Measurement / Conversion",
        "answer": str(ans)
    }

def generateTimeElapsed():
    start_hr = get_random_int(1, 5)
    duration = get_random_int(1, 4)
    end_hr = start_hr + duration
    
    return {
        "type": "userInput",
        "question": f"A movie starts at {start_hr}:00 PM and lasts for {duration} hours. At what time does it end? (Answer formats: 5:00, 5 PM, 5:00 PM)",
        "topic": "Time / Elapsed",
        "answer": f"{end_hr}:00" # We might need fuzzy matching, but exact string valid for now.
    }

# --- Geometry ---

def generateAngles():
    angle = get_random_int(10, 170)
    if angle == 90:
        angle_type = "Right"
    elif angle < 90:
        angle_type = "Acute"
    else:
        angle_type = "Obtuse"
        
    question = f"An angle measures {angle} degrees. What type of angle is it?"
    options = [
        {"value": "Acute", "label": "Acute"},
        {"value": "Right", "label": "Right"},
        {"value": "Obtuse", "label": "Obtuse"},
        {"value": "Straight", "label": "Straight"}
    ]
    
    return {
        "type": "mcq",
        "question": question,
        "topic": "Geometry / Angles",
        "options": options,
        "answer": angle_type
    }

def generateAreaShape():
    l = get_random_int(5, 12)
    w = get_random_int(2, 8)
    area = l * w
    
    return {
        "type": "userInput",
        "question": f"Calculate the area of a rectangle with length {l} cm and width {w} cm.",
        "topic": "Geometry / Area",
        "answer": str(area)
    }

def generatePerimeterShape():
    side = get_random_int(4, 15)
    perim = 4 * side
    
    return {
        "type": "userInput",
        "question": f"Calculate the perimeter of a square with side length {side} m.",
        "topic": "Geometry / Perimeter",
        "answer": str(perim)
    }

def generatePieChart():
    # Text-based pie chart interpretation
    activities = ["Reading", "Playing", "Sleeping", "Studying"]
    percentages = [25, 25, 30, 20] # Sum 100
    
    target_idx = get_random_int(0, 3)
    target_act = activities[target_idx]
    target_perc = percentages[target_idx]
    
    chart_desc = ", ".join([f"{a}: {p}%" for a, p in zip(activities, percentages)])
    
    question = f"Look at the data from a pie chart: [{chart_desc}]. What percentage of time is spent on <b>{target_act}</b>?"
    
    return {
        "type": "userInput",
        "question": question,
        "topic": "Data Handling / Pie Chart",
        "answer": str(target_perc)
    }

# --- Others ---

def generateFactors():
    num = random.choice([12, 15, 18, 20, 24, 30])
    
    # Calculate factors
    factors = []
    for i in range(1, num + 1):
        if num % i == 0:
            factors.append(i)
            
    factor_str = ", ".join(map(str, factors))
    
    # We'll stick to listing them or checking count. Let's ask for the number of factors.
    return {
        "type": "mcq",
        "question": f"How many factors does the number {num} have?",
        "topic": "Numbers / Factors",
        "options": [
            {"value": str(len(factors)), "label": str(len(factors))},
            {"value": str(len(factors)+1), "label": str(len(factors)+1)},
            {"value": str(len(factors)-1), "label": str(len(factors)-1)},
            {"value": str(len(factors)+2), "label": str(len(factors)+2)}
        ],
        "answer": str(len(factors))
    }

def generateLCM():
    pair = random.choice([(2,3), (4,5), (3,4), (2,6), (6,8)])
    a, b = pair
    lcm = math.lcm(a, b)
    
    return {
        "type": "userInput",
        "question": f"Find the LCM of {a} and {b}.",
        "topic": "Numbers / LCM",
        "answer": str(lcm)
    }

def generateFactorTree():
    num = random.choice([12, 18, 20, 24])
    # Prime factorization question
    if num == 12: ans = "2, 2, 3"
    elif num == 18: ans = "2, 3, 3"
    elif num == 20: ans = "2, 2, 5"
    elif num == 24: ans = "2, 2, 2, 3"
    
    options = [
        {"value": ans, "label": ans},
        {"value": "2, 3, 4", "label": "2, 3, 4"},
        {"value": "1, 2, " + str(num//2), "label": f"1, 2, {num//2}"},
        {"value": str(num), "label": str(num)}
    ]
    random.shuffle(options)
    
    return {
        "type": "mcq",
        "question": f"Which represents the prime factorization of {num}?",
        "topic": "Numbers / Factorization",
        "options": options,
        "answer": ans
    }

def generateSymmetry():
    letters = [
        ("A", "1"),
        ("H", "2"),
        ("M", "1"),
        ("X", "2"),
        ("F", "0"),
        ("P", "0")
    ]
    l, sym_lines = random.choice(letters)
    
    return {
        "type": "mcq",
        "question": f"How many lines of symmetry does the letter '{l}' have?",
        "topic": "Geometry / Symmetry",
        "options": [
            {"value": "0", "label": "0"},
            {"value": "1", "label": "1"},
            {"value": "2", "label": "2"},
            {"value": "Many", "label": "Many"}
        ],
        "answer": sym_lines
    }

def generateNumberPattern():
    start = get_random_int(1, 10)
    step = get_random_int(2, 5)
    seq = [start, start + step, start + 2*step, start + 3*step]
    nxt = start + 4*step
    
    seq_str = ", ".join(map(str, seq))
    
    return {
        "type": "userInput",
        "question": f"Complete the pattern: {seq_str}, ...?",
        "topic": "Patterns / Number",
        "answer": str(nxt)
    }

def generatePicturePattern():
    # Simple symbol pattern
    symbols = ["⭐", "🔵", "🟥"]
    pat_type = get_random_int(0, 1)
    
    if pat_type == 0:
        # ABAB
        s1, s2 = random.sample(symbols, 2)
        seq = f"{s1} {s2} {s1} {s2}"
        ans = s1
    else:
        # AAB AAB
        s1, s2 = random.sample(symbols, 2)
        seq = f"{s1} {s1} {s2} {s1} {s1} {s2}"
        ans = s1
        
    return {
        "type": "mcq",
        "question": f"What comes next in the pattern?<br/>{seq} ...?",
        "topic": "Patterns / Picture",
        "options": [{"value": s, "label": s} for s in symbols],
        "answer": ans
    }


GRADE5_GENERATORS = {
    "q1": generatePlaceValueLarge,
    "q2": generateCompareLarge,
    "q3": generateExpandedForm,
    "q4": generateAdditionLarge,
    "q5": generateSubtractionLarge,
    "q6": generateMultiplicationLarge,
    "q7": generateDivisionLarge,
    "q8": generateEstimationOps,
    "q9": generateEquivalentFractions,
    "q10": generateSimplifyFractions,
    "q11": generateAddUnlikeFractions,
    "q12": generateDecimalPlaceValue,
    "q13": generateDecimalOps,
    "q14": generateUnitConversion,
    "q15": generateTimeElapsed,
    "q16": generateAngles,
    "q17": generateAreaShape,
    "q18": generatePerimeterShape,
    "q19": generatePieChart,
    "q20": generateFactors,
    "q21": generateLCM,
    "q22": generateFactorTree,
    "q23": generateSymmetry,
    "q24": generateNumberPattern,
    "q25": generatePicturePattern
}
