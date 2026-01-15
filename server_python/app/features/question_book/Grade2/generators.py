import random

def get_random_int(min_val, max_val):
    return random.randint(min_val, max_val)

def shuffle_array(arr):
    random.shuffle(arr)
    return arr

def number_to_words(num):
    ones = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine']
    teens = ['ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen']
    tens = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety']

    if num == 0:
        return 'zero'
    if num < 10:
        return ones[num]
    if num < 20:
        return teens[num - 10]
    if num < 100:
        return tens[num // 10] + ('' if num % 10 == 0 else ' ' + ones[num % 10])
    if num < 1000:
        return ones[num // 100] + ' hundred' + ('' if num % 100 == 0 else ' ' + number_to_words(num % 100))
    return str(num)

# --- Number Sense ---

def generate_counting():
    start = get_random_int(100, 990)
    answer = start + 1
    return {
        "type": "userInput",
        "question": f"What number comes after {start}?",
        "topic": "Number Sense / Counting",
        "answer": str(answer)
    }

def generate_place_value():
    tens = get_random_int(1, 9)
    ones = get_random_int(0, 9)
    number = tens * 10 + ones
    answer = f"{tens} tens and {ones} ones"
    options = [{"value": answer, "label": answer}]
    while len(options) < 4:
        t = get_random_int(1, 9)
        o = get_random_int(0, 9)
        val = f"{t} tens and {o} ones"
        if not any(opt["value"] == val for opt in options):
            options.append({"value": val, "label": val})
    shuffle_array(options)
    return {
        "type": "mcq",
        "question": f"Break down the number {number} into tens and ones.",
        "topic": "Number Sense / Place Value",
        "options": options,
        "answer": answer
    }

def generate_value():
    hundreds = get_random_int(1, 9)
    tens = get_random_int(0, 9)
    ones = get_random_int(0, 9)
    while tens == hundreds: tens = get_random_int(0, 9)
    while ones == hundreds or ones == tens: ones = get_random_int(0, 9)
    number = hundreds * 100 + tens * 10 + ones
    positions = ['ones', 'tens', 'hundreds']
    target_pos = random.choice(positions)
    if target_pos == 'ones':
        target_digit = ones
        answer = str(ones)
    elif target_pos == 'tens':
        target_digit = tens
        answer = str(tens * 10)
    else:
        target_digit = hundreds
        answer = str(hundreds * 100)
    question = f"What is the place value of {target_digit} in {number}?"
    distractors = {answer, str(target_digit), str(target_digit * 10), str(target_digit * 100), str(get_random_int(10, 900))}
    options = [{"value": val, "label": val} for val in list(distractors)[:4]]
    return {
        "type": "mcq",
        "question": question,
        "topic": "Number Sense / Value",
        "options": shuffle_array(options),
        "answer": answer
    }

def generate_expanded_form():
    hundreds = get_random_int(1, 9)
    tens = get_random_int(1, 9)
    ones = get_random_int(1, 9)
    number = hundreds * 100 + tens * 10 + ones
    answer = f"{hundreds * 100} + {tens * 10} + {ones}"
    options = shuffle_array([
        {"value": answer, "label": answer},
        {"value": f"{hundreds * 100} + {tens} + {ones}", "label": f"{hundreds * 100} + {tens} + {ones}"},
        {"value": f"{hundreds} + {tens * 10} + {ones}", "label": f"{hundreds} + {tens * 10} + {ones}"},
        {"value": f"{hundreds * 100} + {tens * 10} + {ones * 10}", "label": f"{hundreds * 100} + {tens * 10} + {ones * 10}"}
    ])
    return {
        "type": "mcq",
        "question": f"What is the expanded form of {number}?",
        "topic": "Number Sense / Expanded Form",
        "options": options,
        "answer": answer
    }

def generate_comparison():
    num1 = get_random_int(100, 999)
    num2 = get_random_int(100, 999)
    while num1 == num2: num2 = get_random_int(100, 999)
    answer = ">" if num1 > num2 else "<"
    options = shuffle_array([
        {"value": ">", "label": ">"},
        {"value": "<", "label": "<"},
        {"value": "=", "label": "="}
    ])
    return {
        "type": "mcq",
        "question": f"Compare: {num1} _ {num2}",
        "topic": "Number Sense / Comparison",
        "options": options,
        "answer": answer
    }

def generate_ascending_descending():
    nums = random.sample(range(100, 1000), 4)
    order_type = random.choice(["ascending", "descending"])
    sorted_nums = sorted(nums, reverse=(order_type == "descending"))
    answer = ", ".join(map(str, sorted_nums))
    distractor1 = ", ".join(map(str, sorted_nums[::-1]))
    
    def get_permutation():
        p = nums[:]
        random.shuffle(p)
        return ", ".join(map(str, p))
    
    options_set = {answer, distractor1}
    while len(options_set) < 4:
        options_set.add(get_permutation())
    
    options_array = [{"value": val, "label": val} for val in options_set]
    return {
        "type": "mcq",
        "question": f"Arrange in {order_type} order: {', '.join(map(str, nums))}",
        "topic": "Number Sense / Ordering",
        "options": shuffle_array(options_array),
        "answer": answer
    }

def generate_number_names():
    num = get_random_int(100, 999)
    answer = number_to_words(num)
    options = shuffle_array([
        {"value": answer, "label": answer},
        {"value": number_to_words(num + 1), "label": number_to_words(num + 1)},
        {"value": number_to_words(num - 1), "label": number_to_words(num - 1)},
        {"value": number_to_words(num + 10), "label": number_to_words(num + 10)}
    ])
    return {
        "type": "mcq",
        "question": f"Write the number name for {num}",
        "topic": "Number Sense / Number Names",
        "options": options,
        "answer": answer
    }

def generate_skip_counting(step=None):
    if step is None:
        step = get_random_int(2, 5)
    start = get_random_int(1, 20) * step
    sequence = [start, start + step, start + 2 * step, start + 3 * step]
    answer = start + 4 * step
    return {
        "type": "userInput",
        "question": f"Skip count by {step}: {', '.join(map(str, sequence))}, ...?",
        "topic": "Number Sense / Skip Counting",
        "answer": str(answer)
    }

def generate_even_odd():
    num = get_random_int(10, 99)
    answer = "Even" if num % 2 == 0 else "Odd"
    return {
        "type": "mcq",
        "question": f"Is {num} Even or Odd?",
        "topic": "Number Sense / Even & Odd",
        "options": [{"value": "Even", "label": "Even"}, {"value": "Odd", "label": "Odd"}],
        "answer": answer
    }

# --- Addition ---

def generate_add_no_carry():
    num1 = get_random_int(10, 50)
    num2 = get_random_int(10, 40)
    if (num1 % 10) + (num2 % 10) >= 10:
        return generate_add_no_carry()
    answer = num1 + num2
    return {
        "type": "userInput",
        "question": f"Add: {num1} + {num2} = ?",
        "topic": "Addition / Without Carry",
        "answer": str(answer)
    }

def generate_add_with_carry():
    num1 = get_random_int(15, 58)
    num2 = get_random_int(15, 39)
    if (num1 % 10) + (num2 % 10) < 10:
        return generate_add_with_carry()
    answer = num1 + num2
    return {
        "type": "userInput",
        "question": f"Add: {num1} + {num2} = ?",
        "topic": "Addition / With Carry",
        "answer": str(answer)
    }

def generate_add_word_problems():
    names = ["Raju", "Rama", "Ali", "John"]
    items = ["marbles", "stamps", "cards", "coins"]
    name = random.choice(names)
    item = random.choice(items)
    num1 = get_random_int(15, 45)
    num2 = get_random_int(10, 30)
    answer = num1 + num2
    return {
        "type": "userInput",
        "question": f"{name} has {num1} {item}. He buys {num2} more. How many {item} does he have in total?",
        "topic": "Addition / Word Problems",
        "answer": str(answer)
    }

# --- Subtraction ---

def generate_sub_no_borrow():
    num1 = get_random_int(50, 99)
    num2 = get_random_int(10, 40)
    if (num1 % 10) < (num2 % 10):
        return generate_sub_no_borrow()
    answer = num1 - num2
    return {
        "type": "userInput",
        "question": f"Subtract: {num1} - {num2} = ?",
        "topic": "Subtraction / Without Borrow",
        "answer": str(answer)
    }

def generate_sub_with_borrow():
    num1 = get_random_int(50, 90)
    num2 = get_random_int(15, 48)
    if (num1 % 10) >= (num2 % 10):
        return generate_sub_with_borrow()
    answer = num1 - num2
    return {
        "type": "userInput",
        "question": f"Subtract: {num1} - {num2} = ?",
        "topic": "Subtraction / With Borrow",
        "answer": str(answer)
    }

def generate_sub_word_problems():
    names = ["Raju", "Ram", "Ali", "John"]
    items = ["apples", "candies", "toys", "books"]
    name = random.choice(names)
    item = random.choice(items)
    num1 = get_random_int(40, 80)
    num2 = get_random_int(10, 30)
    answer = num1 - num2
    return {
        "type": "userInput",
        "question": f"{name} had {num1} {item}. He gave {num2} to his friend. How many {item} are left?",
        "topic": "Subtraction / Word Problems",
        "answer": str(answer)
    }

# --- Multiplication ---

def generate_repeated_addition():
    num = get_random_int(2, 5)
    times = get_random_int(2, 5)
    answer = num * times
    addition_str = " + ".join([str(num)] * times)
    return {
        "type": "userInput",
        "question": f"{times} times {num} is the same as: </br> {addition_str} = ?",
        "topic": "Multiplication / Repeated Addition",
        "answer": str(answer)
    }

def generate_tables():
    num = get_random_int(2, 10)
    times = get_random_int(2, 10)
    answer = num * times
    return {
        "type": "userInput",
        "question": f"{num} x {times} = ?",
        "topic": "Multiplication / Tables",
        "answer": str(answer)
    }

# --- Money ---

def generate_identify_money():
    notes = [10, 20, 50, 100, 200, 500]
    note = random.choice(notes)
    unique_options = {note}
    while len(unique_options) < 4:
        unique_options.add(random.choice(notes))
    options = [{"value": f"/assets/grade2/rupee_{val}.jpg", "image": f"/assets/grade2/rupee_{val}.jpg"} for val in unique_options]
    return {
        "type": "mcq",
        "question": f"Identify the note </br>₹{note}",
        "topic": "Money / Basics",
        "answer": f"/assets/grade2/rupee_{note}.jpg",
        "options": shuffle_array(options)
    }

def generate_add_money():
    num1 = get_random_int(10, 50)
    num2 = get_random_int(10, 40)
    answer = num1 + num2
    return {
        "type": "userInput",
        "question": f"₹{num1} + ₹{num2} = ?",
        "topic": "Money / Addition",
        "answer": str(answer)
    }

def generate_sub_money():
    num1 = get_random_int(50, 90)
    num2 = get_random_int(10, 40)
    answer = num1 - num2
    return {
        "type": "userInput",
        "question": f"₹{num1} - ₹{num2} = ?",
        "topic": "Money / Subtraction",
        "answer": str(answer)
    }

# --- Measurement ---

def generate_length():
    length = get_random_int(5, 20)
    unit = "cm"
    answer = f"{length} {unit}"
    options = shuffle_array([
        {"value": answer, "label": answer},
        {"value": f"{length + 2} {unit}", "label": f"{length + 2} {unit}"},
        {"value": f"{length - 1} {unit}", "label": f"{length - 1} {unit}"},
        {"value": f"{length + 5} {unit}", "label": f"{length + 5} {unit}"}
    ])
    return {
        "type": "mcq",
        "question": f"If a pencil is {length} {unit} long, what is its length?",
        "topic": "Measurement / Length",
        "options": options,
        "answer": answer
    }

def generate_weight():
    comparisons = [
        {"heavy": "Elephant", "light": "Ant"},
        {"heavy": "Truck", "light": "Car"},
        {"heavy": "Book", "light": "Paper"},
        {"heavy": "Watermelon", "light": "Grape"}
    ]
    comp = random.choice(comparisons)
    ask_heavy = random.random() > 0.5
    question = "Which object is heavier?" if ask_heavy else "Which object is lighter?"
    answer = comp["heavy"] if ask_heavy else comp["light"]
    options = shuffle_array([{"value": comp["heavy"], "label": comp["heavy"]}, {"value": comp["light"], "label": comp["light"]}])
    return {
        "type": "mcq",
        "question": question,
        "topic": "Measurement / Weight",
        "options": options,
        "answer": answer
    }

def generate_capacity():
    comparisons = [
        {"more": "Bucket", "less": "Mug"},
        {"more": "Tank", "less": "Bucket"},
        {"more": "Bottle", "less": "Spoon"},
        {"more": "Jug", "less": "Cup"}
    ]
    comp = random.choice(comparisons)
    ask_more = random.random() > 0.5
    question = "Which container holds more?" if ask_more else "Which container holds less?"
    answer = comp["more"] if ask_more else comp["less"]
    options = shuffle_array([{"value": comp["more"], "label": comp["more"]}, {"value": comp["less"], "label": comp["less"]}])
    return {
        "type": "mcq",
        "question": question,
        "topic": "Measurement / Capacity",
        "options": options,
        "answer": answer
    }

def generate_time():
    hour = get_random_int(1, 12)
    minute = get_random_int(0, 11) * 5
    minute_str = f"0{minute}" if minute < 10 else str(minute)
    time_val = f"{hour}:{minute_str}"
    question = f"What time does the clock show if the hour hand is at {hour} and minute hand is at {12 if minute // 5 == 0 else minute // 5}?"
    options = shuffle_array([
        {"value": time_val, "label": time_val},
        {"value": f"{hour + 1}:{minute_str}", "label": f"{hour + 1}:{minute_str}"},
        {"value": f"{hour}:{minute_str if minute >= 10 else '15'}", "label": f"{hour}:{minute_str if minute >= 10 else '15'}"},
        {"value": f"{hour - 1}:{minute_str}", "label": f"{hour - 1}:{minute_str}"}
    ])
    return {
        "type": "mcq",
        "question": question,
        "topic": "Measurement / Time",
        "options": options,
        "answer": time_val
    }

# --- Geometry ---

def generate_identify_shapes():
    shapes = [
        {
            "name": "Circle",
            "objects": [
                {"name": "Clock", "img": "⏰"},
                {"name": "Coin", "img": "🪙"},
                {"name": "Wheel", "img": "🛞"},
                {"name": "Ball", "img": "⚽"},
                {"name": "Sun", "img": "☀️"},
                {"name": "Moon", "img": "🌕"}
            ]
        },
        {
            "name": "Square",
            "objects": [
                {"name": "Window", "img": "🪟"},
                {"name": "Frame", "img": "🖼️"},
                {"name": "Dice", "img": "🎲"}
            ]
        },
        {
            "name": "Triangle",
            "objects": [
                {"name": "Slice of Pizza", "img": "🍕"},
                {"name": "Traffic Sign", "img": "⚠️"},
                {"name": "Tent", "img": "⛺"}
            ]
        },
        {
            "name": "Rectangle",
            "objects": [
                {"name": "Door", "img": "🚪"},
                {"name": "Book", "img": "📖"},
                {"name": "Mobile Phone", "img": "📱"},
                {"name": "TV Screen", "img": "📺"},
                {"name": "Envelope", "img": "✉️"}
            ]
        }
    ]
    shape = random.choice(shapes)
    obj = random.choice(shape["objects"])
    options = shuffle_array([{"value": s["name"], "label": s["name"]} for s in shapes])
    return {
        "type": "mcq",
        "question": f"What shape does a {obj['name']} look like? <br/> <div style=\"font-size: 4rem; margin-top: 10px;\">{obj['img']}</div>",
        "topic": "Geometry / Shapes",
        "options": options,
        "answer": shape["name"]
    }

def generate_patterns():
    patterns = [
        {"seq": ["A", "B", "C", "A", "B"], "next": "C", "wrong": "A"},
        {"seq": ["⭐", "⭐", "🌙", "⭐", "⭐"], "next": "🌙", "wrong": "⭐"},
        {"seq": ["10", "20", "30", "40"], "next": "50", "wrong": "60"},
        {"seq": ["⬆️", "⬇️", "⬆️", "⬇️"], "next": "⬆️", "wrong": "⬇️"}
    ]
    pattern = random.choice(patterns)
    return {
        "type": "mcq",
        "question": f"Complete the pattern: </br> {', '.join(pattern['seq'])}, ...?",
        "topic": "Geometry / Patterns",
        "options": shuffle_array([{"value": pattern["next"], "label": pattern["next"]}, {"value": pattern["wrong"], "label": pattern["wrong"]}]),
        "answer": pattern["next"]
    }

# --- Data Handling ---

def create_tally_svg(count):
    height = 50
    spacing = 20
    num_groups = (count + 4) // 5
    total_width = num_groups * (40 + spacing)
    svg_lines = ""
    for g in range(num_groups):
        group_x = g * (40 + spacing)
        marks_in_group = min(5, count - g * 5)
        for i in range(min(marks_in_group, 4)):
            x = group_x + i * 10
            svg_lines += f'<line x1="{x}" y1="5" x2="{x}" y2="45" stroke="white" stroke-width="4" stroke-linecap="round" />'
        if marks_in_group == 5:
            svg_lines += f'<line x1="{group_x - 5}" y1="5" x2="{group_x + 35}" y2="45" stroke="white" stroke-width="4" stroke-linecap="round" />'
    return f'<svg width="{total_width}" height="{height}" viewBox="0 0 {total_width} {height}" xmlns="http://www.w3.org/2000/svg" style="display:inline-block; vertical-align:middle; overflow:visible;">{svg_lines}</svg>'

def generate_tally():
    count = get_random_int(5, 15)
    tally_svg = create_tally_svg(count)
    return {
        "type": "userInput",
        "question": f"What number does this tally show? <br/> <div style=\"margin-top: 20px;\">{tally_svg}</div>",
        "topic": "Data Handling / Tally",
        "answer": str(count)
    }

def generate_pictograph():
    scale = get_random_int(2, 5)
    count = get_random_int(2, 6)
    total = count * scale
    return {
        "type": "userInput",
        "question": f"If 1 🍎 = {scale} apples, how many apples are there in: {'🍎 ' * count}?",
        "topic": "Data Handling / Pictograph",
        "answer": str(total)
    }

# --- Logical ---

def generate_sequences():
    start = get_random_int(1, 10)
    step = get_random_int(2, 5)
    seq = [start, start + step, start + 2 * step, start + 3 * step]
    next_val = start + 4 * step
    return {
        "type": "userInput",
        "question": f"Complete the sequence: </br>{', '.join(map(str, seq))}, ...?",
        "topic": "Logical / Sequences",
        "answer": str(next_val)
    }

def generate_missing_numbers():
    start = get_random_int(20, 80)
    answer = start + 1
    return {
        "type": "userInput",
        "question": f"Fill in the missing number: {start}, _ , {start + 2}",
        "topic": "Logical / Missing Numbers",
        "answer": str(answer)
    }

GRADE2_GENERATORS = {
    "Number Sense / Counting": generate_counting,
    "Number Sense / Place Value": generate_place_value,
    "Number Sense / Value": generate_value,
    "Number Sense / Expanded Form": generate_expanded_form,
    "Number Sense / Comparison": generate_comparison,
    "Number Sense / Ordering": generate_ascending_descending,
    "Number Sense / Number Names": generate_number_names,
    "Number Sense / Skip Counting": generate_skip_counting,
    "Number Sense / Even & Odd": generate_even_odd,
    "Addition / Without Carry": generate_add_no_carry,
    "Addition / With Carry": generate_add_with_carry,
    "Addition / Word Problems": generate_add_word_problems,
    "Subtraction / Without Borrow": generate_sub_no_borrow,
    "Subtraction / With Borrow": generate_sub_with_borrow,
    "Subtraction / Word Problems": generate_sub_word_problems,
    "Multiplication / Repeated Addition": generate_repeated_addition,
    "Multiplication / Tables": generate_tables,
    "Money / Basics": generate_identify_money,
    "Money / Addition": generate_add_money,
    "Money / Subtraction": generate_sub_money,
    "Measurement / Length": generate_length,
    "Measurement / Weight": generate_weight,
    "Measurement / Capacity": generate_capacity,
    "Measurement / Time": generate_time,
    "Geometry / Shapes": generate_identify_shapes,
    "Geometry / Patterns": generate_patterns,
    "Data Handling / Tally": generate_tally,
    "Data Handling / Pictograph": generate_pictograph,
    "Logical / Sequences": generate_sequences,
    "Logical / Missing Numbers": generate_missing_numbers,
}
