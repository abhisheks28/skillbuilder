import random
import math
import base64

def get_random_int(min_val, max_val):
    return random.randint(min_val, max_val)

def shuffle_array(array):
    random.shuffle(array)
    return array

# --- Number Sense & Operations ---

def generate_addition_2digit():
    num1 = get_random_int(10, 99)
    num2 = get_random_int(10, 99)
    answer = num1 + num2
    question = f"Add: $$ {num1} + {num2} = ? $$"
    return {
        "type": "userInput",
        "question": question,
        "topic": "Number Sense / Addition",
        "answer": str(answer)
    }

def generate_addition_3digit():
    num1 = get_random_int(100, 500)
    num2 = get_random_int(100, 499)
    answer = num1 + num2
    question = f"Add: $$ {num1} + {num2} = ? $$"
    return {
        "type": "userInput",
        "question": question,
        "topic": "Number Sense / Addition",
        "answer": str(answer)
    }

def generate_subtraction_2digit():
    num1 = get_random_int(10, 99)
    num2 = get_random_int(10, num1)
    answer = num1 - num2
    question = f"Subtract: $$ {num1} - {num2} = ? $$"
    return {
        "type": "userInput",
        "question": question,
        "topic": "Number Sense / Subtraction",
        "answer": str(answer)
    }

def generate_subtraction_3digit():
    num1 = get_random_int(500, 999)
    num2 = get_random_int(100, num1)
    answer = num1 - num2
    question = f"Subtract: $$ {num1} - {num2} = ? $$"
    return {
        "type": "userInput",
        "question": question,
        "topic": "Number Sense / Subtraction",
        "answer": str(answer)
    }

def generate_multiplication_tables_6to9():
    tables = [6, 7, 8, 9]
    num1 = random.choice(tables)
    num2 = get_random_int(1, 10)
    answer = num1 * num2
    question = f"Multiply: $$ {num1} × {num2} = ? $$"
    return {
        "type": "userInput",
        "question": question,
        "topic": "Number Sense / Multiplication",
        "answer": str(answer)
    }

def generate_multiplication_tables_12to19():
    tables = [12, 13, 14, 15, 16, 17, 18, 19]
    num1 = random.choice(tables)
    num2 = get_random_int(1, 10)
    answer = num1 * num2
    question = f"Multiply: $$ {num1} × {num2} = ? $$"
    return {
        "type": "userInput",
        "question": question,
        "topic": "Number Sense / Multiplication",
        "answer": str(answer)
    }

def generate_division_1stlevel():
    divisor = get_random_int(2, 9)
    quotient = get_random_int(2, 12)
    dividend = divisor * quotient
    question = f"Divide: $$ {dividend} \\div {divisor} = ? $$"
    return {
        "type": "userInput",
        "question": question,
        "topic": "Number Sense / Division",
        "answer": str(quotient)
    }

def generate_division_2ndlevel():
    divisor = get_random_int(10, 15)
    quotient = get_random_int(2, 10)
    dividend = divisor * quotient
    question = f"Divide: $$ {dividend} \\div {divisor} = ? $$"
    return {
        "type": "userInput",
        "question": question,
        "topic": "Number Sense / Division",
        "answer": str(quotient)
    }

def generate_missing_number_addition():
    num1 = get_random_int(10, 50)
    missing = get_random_int(5, 20)
    total = num1 + missing
    question = f"Find the missing number: $$ {num1} +  ?  = {total} $$"
    return {
        "type": "userInput",
        "question": question,
        "topic": "Number Sense / Missing Number",
        "answer": str(missing)
    }

def generate_missing_number_subtraction():
    num1 = get_random_int(20, 60)
    missing = get_random_int(5, 15)
    result = num1 - missing
    question = f"Find the missing number: $$ {num1} - ? = {result} $$"
    return {
        "type": "userInput",
        "question": question,
        "topic": "Number Sense / Missing Number",
        "answer": str(missing)
    }

def generate_addition_then_subtraction():
    num1 = get_random_int(5, 15)
    num2 = get_random_int(2, 10)
    num3 = get_random_int(1, 5)
    answer = num1 + num2 - num3
    question = f"Solve: $$ {num1} + {num2} - {num3} = ? $$"
    return {
        "type": "userInput",
        "question": question,
        "topic": "Number Sense / Mixed Operations",
        "answer": str(answer)
    }

def generate_subtraction_then_addition():
    num1 = get_random_int(5, 15)
    num2 = get_random_int(2, num1)
    num3 = get_random_int(1, 5)
    answer = num1 - num2 + num3
    question = f"Solve: $$ {num1} - {num2} + {num3} = ? $$"
    return {
        "type": "userInput",
        "question": question,
        "topic": "Number Sense / Mixed Operations",
        "answer": str(answer)
    }

def generate_fractions():
    denominator = get_random_int(2, 8)
    numerator = get_random_int(1, denominator - 1)
    question = f"What fraction represents {numerator} part{'s' if numerator > 1 else ''} out of {denominator} equal parts?"
    answer = f"$\\frac{{{numerator}}}{{{denominator}}}$"
    options = shuffle_array([
        { "value": answer, "label": answer },
        { "value": f"$\\frac{{{denominator}}}{{{numerator}}}$", "label": f"$\\frac{{{denominator}}}{{{numerator}}}$" },
        { "value": f"$\\frac{{{numerator}}}{{{denominator + 1}}}$", "label": f"$\\frac{{{numerator}}}{{{denominator + 1}}}$" },
        { "value": f"$\\frac{{{numerator + 1}}}{{{denominator}}}$", "label": f"$\\frac{{{numerator + 1}}}{{{denominator}}}$" }
    ])
    return {
        "type": "mcq",
        "question": question,
        "topic": "Number Sense / Fractions",
        "options": options,
        "answer": answer
    }

def generate_compare_fractions():
    num = 1
    den1 = get_random_int(2, 5)
    den2 = get_random_int(2, 5)
    while den1 == den2:
        den2 = get_random_int(2, 5)
    answer = ">" if den1 < den2 else "<"
    question = f"Compare: $\\frac{{{num}}}{{{den1}}}$   ?    $\\frac{{{num}}}{{{den2}}}$"
    options = shuffle_array([
        { "value": ">", "label": "> More than" },
        { "value": "<", "label": "< Less than" },
        { "value": "=", "label": "= Equal to" }
    ])
    return {
        "type": "mcq",
        "question": question,
        "topic": "Number Sense / Compare Fractions",
        "options": options,
        "answer": answer
    }

def number_to_words(num):
    ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"]
    tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"]
    if num < 20:
        return ones[num]
    else:
        tens_place = num // 10
        ones_place = num % 10
        return f"{tens[tens_place]} {ones[ones_place]}".strip()

def generate_number_to_words():
    number = get_random_int(1, 99)
    number_in_words = number_to_words(number)
    question = f"What is the number name for: $ {number} $"
    options = shuffle_array([
        { "value": number_in_words, "label": number_in_words },
        { "value": number_to_words(get_random_int(1, 99)), "label": number_to_words(get_random_int(1, 99)) },
        { "value": number_to_words(get_random_int(1, 99)), "label": number_to_words(get_random_int(1, 99)) },
        { "value": number_to_words(get_random_int(1, 99)), "label": number_to_words(get_random_int(1, 99)) }
    ])
    return {
        "type": "mcq",
        "question": question,
        "topic": "Number Sense / Number Names",
        "options": options,
        "answer": number_in_words
    }

def generate_words_to_number():
    number = get_random_int(1, 99)
    number_in_words = number_to_words(number)
    question = f"What is the number for: $ {number_in_words} $"
    options = shuffle_array([
        { "value": str(number), "label": str(number) },
        { "value": str(get_random_int(1, 99)), "label": str(get_random_int(1, 99)) },
        { "value": str(get_random_int(1, 99)), "label": str(get_random_int(1, 99)) },
        { "value": str(get_random_int(1, 99)), "label": str(get_random_int(1, 99)) }
    ])
    return {
        "type": "mcq",
        "question": question,
        "topic": "Number Sense / Number Reading",
        "options": options,
        "answer": str(number)
    }

def generate_doubling_question():
    number = get_random_int(1, 20)
    correct_answer = number * 2
    question = f"What is double of $ {number} $"
    def get_incorrect():
        val = get_random_int(1, 100)
        while val == correct_answer:
            val = get_random_int(1, 100)
        return val
    options = shuffle_array([
        { "value": str(correct_answer), "label": str(correct_answer) },
        { "value": str(get_incorrect()), "label": str(get_incorrect()) },
        { "value": str(get_incorrect()), "label": str(get_incorrect()) },
        { "value": str(get_incorrect()), "label": str(get_incorrect()) }
    ])
    return {
        "type": "mcq",
        "question": question,
        "topic": "Number Sense / Doubling",
        "options": options,
        "answer": str(correct_answer)
    }

def generate_halving_question():
    number = get_random_int(1, 10) * 2
    correct_answer = number // 2
    question = f"What is half of $ {number} $"
    def get_incorrect():
        val = get_random_int(1, 10)
        while val == correct_answer:
            val = get_random_int(1, 10)
        return val
    options = shuffle_array([
        { "value": str(correct_answer), "label": str(correct_answer) },
        { "value": str(get_incorrect()), "label": str(get_incorrect()) },
        { "value": str(get_incorrect()), "label": str(get_incorrect()) },
        { "value": str(get_incorrect()), "label": str(get_incorrect()) }
    ])
    return {
        "type": "mcq",
        "question": question,
        "topic": "Number Sense / Halving",
        "options": options,
        "answer": str(correct_answer)
    }

def generate_shapes():
    shapes_list = [
        { "name": "Cube", "properties": "6 faces, 12 edges, 8 vertices" },
        { "name": "Cone", "properties": "1 circular face, 1 vertex" },
        { "name": "Cylinder", "properties": "2 circular faces, 0 vertices" },
        { "name": "Sphere", "properties": "0 faces, 0 edges, 0 vertices" }
    ]
    shape = random.choice(shapes_list)
    question = f"Which 3D shape has {shape['properties']}?"
    distractors = [s for s in shapes_list if s['name'] != shape['name']]
    final_options = shuffle_array([
        { "value": shape['name'], "label": shape['name'] },
        *[ { "value": s['name'], "label": s['name'] } for s in distractors ]
    ])
    return {
        "type": "mcq",
        "question": question,
        "topic": "Geometry / 3D Shapes",
        "options": final_options,
        "answer": shape['name']
    }

def generate_symmetry():
    objects = [
        { "name": "Butterfly", "symmetric": "Yes", "image": "/assets/grade3/butterfly.png" },
        { "name": "Circle", "symmetric": "Yes", "image": "/assets/grade3/circle.png" },
        { "name": "Letter F", "symmetric": "No", "image": "/assets/grade3/F.png" },
        { "name": "Letter G", "symmetric": "No", "image": "/assets/grade3/G.png" }
    ]
    obj = random.choice(objects)
    question = f"Is a {obj['name']} symmetrical?"
    return {
        "type": "mcq",
        "question": question,
        "topic": "Geometry / Symmetry",
        "image": obj['image'],
        "options": [
            { "value": "Yes", "label": "Yes" },
            { "value": "No", "label": "No" }
        ],
        "answer": obj['symmetric']
    }

def generate_length_conversion():
    m = get_random_int(1, 9)
    cm = m * 100
    question = f"Convert {m} meter to centimeters."
    return {
        "type": "userInput",
        "question": question,
        "topic": "Measurement / Length",
        "answer": str(cm)
    }

def generate_weight_conversion():
    kg = get_random_int(1, 5)
    g = kg * 1000
    question = f"Convert {kg} kg to grams."
    return {
        "type": "userInput",
        "question": question,
        "topic": "Measurement / Weight",
        "answer": str(g)
    }

def generate_capacity_conversion():
    l = get_random_int(1, 5)
    ml = l * 1000
    question = f"Convert {l} liters to milliliters."
    return {
        "type": "userInput",
        "question": question,
        "topic": "Measurement / Capacity",
        "answer": str(ml)
    }

def generate_time_reading():
    available_clocks = [1, 2, 3, 5, 7, 8, 9, 10, 12]
    hour = random.choice(available_clocks)
    question = "What hour is shown on the clock?"
    def get_wrong():
        h = get_random_int(1, 12)
        while h == hour:
            h = get_random_int(1, 12)
        return h
    options = shuffle_array([
        { "value": str(hour), "label": str(hour) },
        { "value": str(get_wrong()), "label": str(get_wrong()) },
        { "value": str(get_wrong()), "label": str(get_wrong()) },
        { "value": str(get_wrong()), "label": str(get_wrong()) }
    ])
    return {
        "type": "userInput",
        "question": question,
        "topic": "Measurement / Time",
        "image": f"/assets/grade3/ClockAt{hour}.png",
        "options": options,
        "answer": str(hour)
    }

def generate_identify_money():
    notes = [10, 20, 50, 100, 200, 500]
    note = random.choice(notes)
    question = f"Identify the note </br>₹{note}"
    unique_vals = {note}
    while len(unique_vals) < 4:
        unique_vals.add(random.choice(notes))
    options = shuffle_array([
        { "value": f"/assets/grade2/rupee_{v}.jpg", "image": f"/assets/grade2/rupee_{v}.jpg" } for v in unique_vals
    ])
    return {
        "type": "mcq",
        "question": question,
        "topic": "Money / Basics",
        "answer": f"/assets/grade2/rupee_{note}.jpg",
        "options": options
    }

def generate_money_operations():
    is_addition = random.random() > 0.5
    amount1 = get_random_int(10, 100)
    amount2 = get_random_int(5, 50)
    if is_addition:
        total = amount1 + amount2
        question = f"Add: ₹{amount1} + ₹{amount2} = ?"
    else:
        total = amount1 - amount2
        question = f"Subtract: ₹{amount1} - ₹{amount2} = ?"
    return {
        "type": "userInput",
        "question": question,
        "topic": "Money / Operations",
        "answer": str(total)
    }

def create_tally_svg(count):
    height = 50
    spacing = 20
    num_groups = math.ceil(count / 5)
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
    count = get_random_int(1, 10)
    tally_svg = create_tally_svg(count)
    question = f'Count the tally marks:</br> <div style="margin-top: 20px;">{tally_svg}</div>'
    return {
        "type": "userInput",
        "question": question,
        "topic": "Data Handling / Tally",
        "answer": str(count)
    }

def generate_number_pattern():
    start = get_random_int(1, 10)
    step = get_random_int(2, 5)
    seq = [start, start + step, start + step * 2, start + step * 3]
    next_val = start + step * 4
    question = f"Complete the pattern:</br> {', '.join(map(str, seq))}, ?"
    return {
        "type": "userInput",
        "question": question,
        "topic": "Patterns / Number Patterns",
        "answer": str(next_val)
    }

# --- Advanced Geometry (SVG-based) ---

def create_shape_icon_b64(shape_name, size=30):
    half = size / 2
    svg_content = ""
    shape_name = shape_name.lower()
    if shape_name == "circle":
        svg_content = f'<circle cx="{half}" cy="{half}" r="{half - 2}" fill="#3b82f6" stroke="#1e40af" stroke-width="2"/>'
    elif shape_name == "square":
        svg_content = f'<rect x="2" y="2" width="{size - 4}" height="{size - 4}" fill="#ef4444" stroke="#991b1b" stroke-width="2"/>'
    elif shape_name == "rectangle":
        svg_content = f'<rect x="2" y="{size * 0.25}" width="{size - 4}" height="{size * 0.5}" fill="#10b981" stroke="#065f46" stroke-width="2"/>'
    elif shape_name == "triangle":
        svg_content = f'<polygon points="{half},2 {size - 2},{size - 2} 2,{size - 2}" fill="#f59e0b" stroke="#92400e" stroke-width="2"/>'
    
    svg = f"<svg xmlns='http://www.w3.org/2000/svg' width='{size}' height='{size}' viewBox='0 0 {size} {size}'>{svg_content}</svg>"
    return f"data:image/svg+xml;base64,{base64.b64encode(svg.encode()).decode()}"

def generate_shape_composition():
    toys = [
        {
            "name": "Robot",
            "shapes": ["Circle", "Rectangle", "Square"],
            "svg": lambda w, h: f"""
                <rect x="{w * 0.3}" y="{h * 0.15}" width="{w * 0.4}" height="{h * 0.25}" fill="#e0e0e0" stroke="#333" stroke-width="2"/>
                <circle cx="{w * 0.4}" cy="{h * 0.23}" r="{w * 0.05}" fill="#333"/>
                <circle cx="{w * 0.6}" cy="{h * 0.23}" r="{w * 0.05}" fill="#333"/>
                <rect x="{w * 0.35}" y="{h * 0.45}" width="{w * 0.3}" height="{h * 0.35}" fill="#3b82f6" stroke="#1e40af" stroke-width="2"/>
                <rect x="{w * 0.2}" y="{h * 0.5}" width="{w * 0.1}" height="{h * 0.25}" fill="#ef4444" stroke="#991b1b" stroke-width="2"/>
                <rect x="{w * 0.7}" y="{h * 0.5}" width="{w * 0.1}" height="{h * 0.25}" fill="#ef4444" stroke="#991b1b" stroke-width="2"/>
            """
        },
        {
            "name": "House",
            "shapes": ["Rectangle", "Triangle", "Square"],
            "svg": lambda w, h: f"""
                <polygon points="{w * 0.5},{h * 0.15} {w * 0.15},{h * 0.45} {w * 0.85},{h * 0.45}" fill="#ef4444" stroke="#991b1b" stroke-width="2"/>
                <rect x="{w * 0.2}" y="{h * 0.45}" width="{w * 0.6}" height="{h * 0.4}" fill="#f59e0b" stroke="#92400e" stroke-width="2"/>
                <rect x="{w * 0.35}" y="{h * 0.55}" width="{w * 0.15}" height="{h * 0.25}" fill="#3b82f6" stroke="#1e40af" stroke-width="2"/>
                <rect x="{w * 0.6}" y="{h * 0.55}" width="{w * 0.12}" height="{w * 0.12}" fill="#60a5fa" stroke="#1e40af" stroke-width="2"/>
            """
        },
        {
            "name": "Ice Cream Cone",
            "shapes": ["Circle", "Triangle"],
            "svg": lambda w, h: f"""
                <circle cx="{w * 0.5}" cy="{h * 0.25}" r="{w * 0.2}" fill="#ec4899" stroke="#be185d" stroke-width="2"/>
                <circle cx="{w * 0.45}" cy="{h * 0.35}" r="{w * 0.15}" fill="#f472b6" stroke="#be185d" stroke-width="2"/>
                <circle cx="{w * 0.55}" cy="{h * 0.35}" r="{w * 0.15}" fill="#f472b6" stroke="#be185d" stroke-width="2"/>
                <polygon points="{w * 0.5},{h * 0.9} {w * 0.25},{h * 0.45} {w * 0.75},{h * 0.45}" fill="#f59e0b" stroke="#92400e" stroke-width="2"/>
            """
        },
        {
            "name": "Car",
            "shapes": ["Rectangle", "Circle"],
            "svg": lambda w, h: f"""
                <rect x="{w * 0.15}" y="{h * 0.5}" width="{w * 0.7}" height="{h * 0.25}" fill="#3b82f6" stroke="#1e40af" stroke-width="2"/>
                <rect x="{w * 0.3}" y="{h * 0.3}" width="{w * 0.4}" height="{h * 0.2}" fill="#60a5fa" stroke="#1e40af" stroke-width="2"/>
                <circle cx="{w * 0.3}" cy="{h * 0.75}" r="{w * 0.1}" fill="#1f2937" stroke="#000" stroke-width="2"/>
                <circle cx="{w * 0.7}" cy="{h * 0.75}" r="{w * 0.1}" fill="#1f2937" stroke="#000" stroke-width="2"/>
            """
        },
        {
            "name": "Tree",
            "shapes": ["Rectangle", "Circle", "Triangle"],
            "svg": lambda w, h: f"""
                <rect x="{w * 0.43}" y="{h * 0.5}" width="{w * 0.14}" height="{h * 0.4}" fill="#92400e" stroke="#78350f" stroke-width="2"/>
                <circle cx="{w * 0.5}" cy="{h * 0.3}" r="{w * 0.25}" fill="#10b981" stroke="#065f46" stroke-width="2"/>
                <polygon points="{w * 0.5},{h * 0.15} {w * 0.25},{h * 0.45} {w * 0.75},{h * 0.45}" fill="#10b981" stroke="#065f46" stroke-width="2"/>
            """
        }
    ]
    toy = random.choice(toys)
    width, height = 300, 300
    toy_svg = f"<svg xmlns='http://www.w3.org/2000/svg' width='{width}' height='{height}' viewBox='0 0 {width} {height}'>{toy['svg'](width, height)}</svg>"
    toy_image = f"data:image/svg+xml;base64,{base64.b64encode(toy_svg.encode()).decode()}"
    correct_answer = " and ".join(sorted(toy["shapes"]))

    all_shapes = ["Circle", "Square", "Rectangle", "Triangle"]
    wrong_combinations = set()
    attempts = 0
    while len(wrong_combinations) < 3 and attempts < 50:
        attempts += 1
        num_shapes = get_random_int(2, 3)
        available = [s for s in all_shapes if s not in toy["shapes"]]
        if not available:
            combo = random.sample(all_shapes, min(num_shapes, len(all_shapes)))
        elif random.random() > 0.5 and toy["shapes"]:
            combo = [toy["shapes"][0]] + random.sample(available, 1)
        else:
            combo = random.sample(available, min(num_shapes, len(available)))
        
        combo_str = " and ".join(sorted(combo))
        if combo_str != correct_answer:
            wrong_combinations.add(combo_str)
    
    # Fallback
    while len(wrong_combinations) < 3:
        combo = random.sample(all_shapes, 2)
        combo_str = " and ".join(sorted(combo))
        if combo_str != correct_answer:
            wrong_combinations.add(combo_str)

    def create_option_with_icons(shape_list):
        shapes = shape_list.split(" and ")
        icon_size, spacing = 40, 5
        total_width = len(shapes) * icon_size + (len(shapes) - 1) * spacing
        svg_content = f"<svg xmlns='http://www.w3.org/2000/svg' width='{total_width}' height='{icon_size}' viewBox='0 0 {total_width} {icon_size}'>"
        for i, shape in enumerate(shapes):
            x = i * (icon_size + spacing)
            half = icon_size / 2
            s_low = shape.strip().lower()
            if s_low == "circle":
                svg_content += f'<circle cx="{x + half}" cy="{half}" r="{half - 2}" fill="#3b82f6" stroke="#1e40af" stroke-width="2"/>'
            elif s_low == "square":
                svg_content += f'<rect x="{x + 2}" y="2" width="{icon_size - 4}" height="{icon_size - 4}" fill="#ef4444" stroke="#991b1b" stroke-width="2"/>'
            elif s_low == "rectangle":
                svg_content += f'<rect x="{x + 2}" y="{icon_size * 0.25}" width="{icon_size - 4}" height="{icon_size * 0.5}" fill="#10b981" stroke="#065f46" stroke-width="2"/>'
            elif s_low == "triangle":
                svg_content += f'<polygon points="{x + half},2 {x + icon_size - 2},{icon_size - 2} {x + 2},{icon_size - 2}" fill="#f59e0b" stroke="#92400e" stroke-width="2"/>'
        svg_content += "</svg>"
        return {
            "value": shape_list,
            "label": shape_list,
            "image": f"data:image/svg+xml;base64,{base64.b64encode(svg_content.encode()).decode()}"
        }

    options = shuffle_array([
        create_option_with_icons(correct_answer),
        *[create_option_with_icons(w) for w in list(wrong_combinations)]
    ])

    return {
        "type": "mcq",
        "question": f"Look at this {toy['name']}. Which shapes can you see in it?",
        "image": toy_image,
        "topic": "Geometry / Shape Recognition",
        "options": options,
        "answer": correct_answer
    }

# --- 3D Shapes ---

def create_cylinder_svg():
    return """<svg xmlns='http://www.w3.org/2000/svg' width='150' height='200' viewBox='0 0 150 200'>
        <ellipse cx='75' cy='40' rx='50' ry='15' fill='#FFD700' stroke='#000' stroke-width='2'/>
        <rect x='25' y='40' width='100' height='120' fill='#FFD700' stroke='none'/>
        <line x1='25' y1='40' x2='25' y2='160' stroke='#000' stroke-width='2'/>
        <line x1='125' y1='40' x2='125' y2='160' stroke='#000' stroke-width='2'/>
        <ellipse cx='75' cy='160' rx='50' ry='15' fill='#FFA500' stroke='#000' stroke-width='2'/>
        <text x='75' y='190' text-anchor='middle' font-size='18' font-weight='bold' fill='#000'>Cylinder</text>
    </svg>"""

def create_sphere_svg():
    return """<svg xmlns='http://www.w3.org/2000/svg' width='150' height='200' viewBox='0 0 150 200'>
        <circle cx='75' cy='90' r='60' fill='#FF6B6B' stroke='#000' stroke-width='2'/>
        <ellipse cx='75' cy='90' rx='60' ry='30' fill='none' stroke='#8B0000' stroke-width='1.5' opacity='0.3'/>
        <ellipse cx='75' cy='90' rx='30' ry='60' fill='none' stroke='#8B0000' stroke-width='1.5' opacity='0.3'/>
        <text x='75' y='180' text-anchor='middle' font-size='18' font-weight='bold' fill='#000'>Sphere</text>
    </svg>"""

def create_cube_svg():
    return """<svg xmlns='http://www.w3.org/2000/svg' width='150' height='200' viewBox='0 0 150 200'>
        <path d='M 75 30 L 125 60 L 125 120 L 75 150 L 25 120 L 25 60 Z' fill='#4ECDC4' stroke='#000' stroke-width='2'/>
        <path d='M 75 30 L 75 90 L 25 120 L 25 60 Z' fill='#3BA99C' stroke='#000' stroke-width='2'/>
        <path d='M 75 30 L 125 60 L 125 120 L 75 90 Z' fill='#5FD9CF' stroke='#000' stroke-width='2'/>
        <path d='M 75 90 L 125 120 L 75 150 L 25 120 Z' fill='#2D8B80' stroke='#000' stroke-width='2'/>
        <text x='75' y='180' text-anchor='middle' font-size='18' font-weight='bold' fill='#000'>Cube</text>
    </svg>"""

def create_cuboid_svg():
    return """<svg xmlns='http://www.w3.org/2000/svg' width='150' height='200' viewBox='0 0 150 200'>
        <path d='M 40 50 L 110 50 L 130 70 L 130 130 L 60 130 L 40 110 Z' fill='#FFE66D' stroke='#000' stroke-width='2'/>
        <path d='M 40 50 L 40 110 L 60 130 L 60 70 Z' fill='#E6C84F' stroke='#000' stroke-width='2'/>
        <path d='M 110 50 L 130 70 L 130 130 L 110 110 Z' fill='#FFF099' stroke='#000' stroke-width='2'/>
        <path d='M 60 70 L 110 70 L 110 110 L 60 110 Z' fill='#FFE66D' stroke='#000' stroke-width='2'/>
        <text x='75' y='165' text-anchor='middle' font-size='18' font-weight='bold' fill='#000'>Cuboid</text>
    </svg>"""

def create_cone_svg():
    return """<svg xmlns='http://www.w3.org/2000/svg' width='150' height='200' viewBox='0 0 150 200'>
        <path d='M 75 20 L 25 140 L 125 140 Z' fill='#C77DFF' stroke='#000' stroke-width='2'/>
        <ellipse cx='75' cy='140' rx='50' ry='15' fill='#9D4EDD' stroke='#000' stroke-width='2'/>
        <line x1='75' y1='20' x2='75' y2='140' stroke='#7B2CBF' stroke-width='1.5' stroke-dasharray='5,3' opacity='0.5'/>
        <text x='75' y='180' text-anchor='middle' font-size='18' font-weight='bold' fill='#000'>Cone</text>
    </svg>"""

def create_object_icon_b64(name):
    size = 80
    svg = ""
    if name == 'Bottle':
        svg = """<rect x="30" y="15" width="20" height="10" fill="#4299e1" stroke="#2b6cb0" stroke-width="2" rx="2"/>
                 <rect x="25" y="25" width="30" height="45" fill="#63b3ed" stroke="#2b6cb0" stroke-width="2" rx="3"/>
                 <ellipse cx="40" cy="35" rx="8" ry="12" fill="#bee3f8" opacity="0.5"/>"""
    elif name == 'Chalk':
        svg = """<rect x="20" y="15" width="40" height="50" fill="#f7fafc" stroke="#cbd5e0" stroke-width="2" rx="20"/>
                 <line x1="25" y1="25" x2="55" y2="25" stroke="#e2e8f0" stroke-width="2"/>
                 <line x1="25" y1="55" x2="55" y2="55" stroke="#e2e8f0" stroke-width="2"/>"""
    elif name == 'Glue Stick':
        svg = """<rect x="25" y="10" width="30" height="15" fill="#9f7aea" stroke="#6b46c1" stroke-width="2" rx="3"/>
                 <rect x="28" y="25" width="24" height="45" fill="#d6bcfa" stroke="#6b46c1" stroke-width="2" rx="12"/>"""
    elif name == 'Pencils':
        svg = """<polygon points="40,10 45,20 35,20" fill="#f6ad55" stroke="#c05621" stroke-width="1.5"/>
                 <rect x="35" y="20" width="10" height="45" fill="#fbd38d" stroke="#c05621" stroke-width="2"/>
                 <rect x="35" y="60" width="10" height="8" fill="#fc8181" stroke="#c05621" stroke-width="1.5"/>"""
    elif name == 'Globe':
        svg = """<circle cx="40" cy="40" r="25" fill="#4299e1" stroke="#2b6cb0" stroke-width="2"/>
                 <ellipse cx="40" cy="40" rx="25" ry="12" fill="none" stroke="#2c5282" stroke-width="1.5"/>
                 <ellipse cx="40" cy="40" rx="12" ry="25" fill="none" stroke="#2c5282" stroke-width="1.5"/>
                 <line x1="40" y1="15" x2="40" y2="65" stroke="#2c5282" stroke-width="1.5"/>"""
    elif name == 'Ball':
        svg = """<circle cx="40" cy="40" r="25" fill="#fc8181" stroke="#c53030" stroke-width="2"/>
                 <path d="M 20 30 Q 40 25 60 30" fill="none" stroke="#e53e3e" stroke-width="2"/>
                 <path d="M 20 50 Q 40 55 60 50" fill="none" stroke="#e53e3e" stroke-width="2"/>
                 <circle cx="40" cy="40" r="18" fill="none" stroke="#e53e3e" stroke-width="2"/>"""
    elif name == 'Marble':
        svg = """<circle cx="40" cy="40" r="20" fill="#9f7aea" stroke="#6b46c1" stroke-width="2"/>
                 <circle cx="35" cy="35" r="8" fill="#d6bcfa" opacity="0.7"/>
                 <circle cx="32" cy="32" r="4" fill="#faf5ff"/>"""
    elif name == 'Paperweight':
        svg = """<ellipse cx="40" cy="55" rx="22" ry="8" fill="#cbd5e0" stroke="#4a5568" stroke-width="2"/>
                 <path d="M 18 55 L 30 25 L 50 25 L 62 55" fill="#e2e8f0" stroke="#4a5568" stroke-width="2"/>
                 <circle cx="40" cy="30" r="6" fill="#4299e1"/>"""
    elif name == 'Dice':
        svg = """<rect x="20" y="20" width="40" height="40" fill="#f7fafc" stroke="#2d3748" stroke-width="2" rx="4"/>
                 <circle cx="30" cy="30" r="3" fill="#2d3748"/>
                 <circle cx="50" cy="30" r="3" fill="#2d3748"/>
                 <circle cx="30" cy="50" r="3" fill="#2d3748"/>
                 <circle cx="50" cy="50" r="3" fill="#2d3748"/>
                 <circle cx="40" cy="40" r="3" fill="#2d3748"/>"""
    elif name == "Rubik's Cube":
        svg = """<rect x="15" y="25" width="15" height="15" fill="#fc8181" stroke="#2d3748" stroke-width="1.5"/>
                 <rect x="30" y="25" width="15" height="15" fill="#4299e1" stroke="#2d3748" stroke-width="1.5"/>
                 <rect x="45" y="25" width="15" height="15" fill="#48bb78" stroke="#2d3748" stroke-width="1.5"/>
                 <rect x="15" y="40" width="15" height="15" fill="#fbd38d" stroke="#2d3748" stroke-width="1.5"/>
                 <rect x="30" y="40" width="15" height="15" fill="#f7fafc" stroke="#2d3748" stroke-width="1.5"/>
                 <rect x="45" y="40" width="15" height="15" fill="#9f7aea" stroke="#2d3748" stroke-width="1.5"/>"""
    elif name == 'Chalk Box':
        svg = """<rect x="15" y="25" width="50" height="35" fill="#fbd38d" stroke="#c05621" stroke-width="2" rx="3"/>
                 <rect x="20" y="30" width="8" height="25" fill="#f7fafc" stroke="#cbd5e0" stroke-width="1.5" rx="4"/>
                 <rect x="32" y="30" width="8" height="25" fill="#fc8181" stroke="#c53030" stroke-width="1.5" rx="4"/>
                 <rect x="44" y="30" width="8" height="25" fill="#4299e1" stroke="#2b6cb0" stroke-width="1.5" rx="4"/>"""
    elif name == 'Dustbin':
        svg = """<rect x="22" y="20" width="36" height="5" fill="#4a5568" stroke="#2d3748" stroke-width="2" rx="2"/>
                 <path d="M 25 25 L 28 60 L 52 60 L 55 25" fill="#718096" stroke="#2d3748" stroke-width="2"/>
                 <line x1="35" y1="30" x2="37" y2="55" stroke="#4a5568" stroke-width="2"/>
                 <line x1="45" y1="30" x2="43" y2="55" stroke="#4a5568" stroke-width="2"/>"""
    elif name == 'First-Aid box':
        svg = """<rect x="15" y="25" width="50" height="35" fill="#f7fafc" stroke="#e53e3e" stroke-width="3" rx="4"/>
                 <rect x="37" y="30" width="6" height="25" fill="#fc8181" stroke="#c53030" stroke-width="2"/>
                 <rect x="27" y="40" width="26" height="6" fill="#fc8181" stroke="#c53030" stroke-width="2"/>"""
    elif name == 'Book':
        svg = """<rect x="20" y="20" width="40" height="50" fill="#4299e1" stroke="#2b6cb0" stroke-width="2" rx="2"/>
                 <rect x="22" y="22" width="36" height="46" fill="#63b3ed" stroke="#2b6cb0" stroke-width="1"/>
                 <line x1="25" y1="20" x2="25" y2="70" stroke="#2c5282" stroke-width="2"/>"""
    elif name == 'Whiteboards':
        svg = """<rect x="10" y="15" width="60" height="50" fill="#f7fafc" stroke="#2d3748" stroke-width="3" rx="3"/>
                 <line x1="15" y1="25" x2="45" y2="25" stroke="#4299e1" stroke-width="2"/>
                 <line x1="15" y1="35" x2="55" y2="35" stroke="#48bb78" stroke-width="2"/>
                 <circle cx="60" cy="55" r="4" fill="#fc8181"/>"""
    elif name == 'Desks':
        svg = """<rect x="15" y="20" width="50" height="8" fill="#9c4221" stroke="#7c2d12" stroke-width="2"/>
                 <rect x="18" y="28" width="6" height="35" fill="#9c4221" stroke="#7c2d12" stroke-width="2"/>
                 <rect x="56" y="28" width="6" height="35" fill="#9c4221" stroke="#7c2d12" stroke-width="2"/>"""
    elif name == 'Megaphone':
        svg = """<path d="M 20 40 L 35 30 L 35 50 Z" fill="#fbd38d" stroke="#c05621" stroke-width="2"/>
                 <path d="M 35 30 L 60 20 L 60 60 L 35 50 Z" fill="#f6ad55" stroke="#c05621" stroke-width="2"/>
                 <rect x="30" y="45" width="15" height="8" fill="#fc8181" stroke="#c05621" stroke-width="2" rx="2"/>"""
    elif name == 'Birthday cap':
        svg = """<path d="M 40 10 L 20 55 L 60 55 Z" fill="#9f7aea" stroke="#6b46c1" stroke-width="2"/>
                 <ellipse cx="40" cy="55" rx="20" ry="6" fill="#d6bcfa" stroke="#6b46c1" stroke-width="2"/>
                 <circle cx="40" cy="10" r="5" fill="#fbd38d"/>
                 <line x1="25" y1="45" x2="55" y2="45" stroke="#d6bcfa" stroke-width="2"/>"""
    elif name == 'Funnel':
        svg = """<path d="M 20 15 L 60 15 L 45 45 L 35 45 Z" fill="#e2e8f0" stroke="#4a5568" stroke-width="2"/>
                 <rect x="35" y="45" width="10" height="20" fill="#cbd5e0" stroke="#4a5568" stroke-width="2"/>
                 <ellipse cx="40" cy="15" rx="20" ry="5" fill="#f7fafc" stroke="#4a5568" stroke-width="2"/>"""
    else:
        svg = """<circle cx="40" cy="40" r="25" fill="#cbd5e0" stroke="#4a5568" stroke-width="2"/>"""

    full_svg = f"<svg xmlns='http://www.w3.org/2000/svg' width='{size}' height='{size}' viewBox='0 0 {size} {size}'>{svg}</svg>"
    return f"data:image/svg+xml;base64,{base64.b64encode(full_svg.encode()).decode()}"

def generate_3d_shape_matching():
    shapes = {
        'Cylinder': {
            'name': 'Cylinder',
            'objects': ['Bottle', 'Chalk', 'Glue Stick', 'Pencils'],
            'svg': create_cylinder_svg()
        },
        'Sphere': {
            'name': 'Sphere',
            'objects': ['Globe', 'Ball', 'Marble', 'Paperweight'],
            'svg': create_sphere_svg()
        },
        'Cube': {
            'name': 'Cube',
            'objects': ['Dice', "Rubik's Cube", 'Chalk Box', 'Dustbin'],
            'svg': create_cube_svg()
        },
        'Cuboid': {
            'name': 'Cuboid',
            'objects': ['First-Aid box', 'Book', 'Whiteboards', 'Desks'],
            'svg': create_cuboid_svg()
        },
        'Cone': {
            'name': 'Cone',
            'objects': ['Megaphone', 'Birthday cap', 'Funnel'],
            'svg': create_cone_svg()
        }
    }
    
    selected_name = random.choice(list(shapes.keys()))
    shape = shapes[selected_name]
    correct_answer = random.choice(shape['objects'])
    
    wrong_pool = []
    for k, v in shapes.items():
        if k != selected_name:
            wrong_pool.extend(v['objects'])
    
    wrong_answers = random.sample(wrong_pool, 3)
    
    def m_opt(name):
        return {
            "value": name,
            "label": name,
            "image": create_object_icon_b64(name)
        }
    
    options = shuffle_array([m_opt(correct_answer), *[m_opt(w) for w in wrong_answers]])
    shape_img = f"data:image/svg+xml;base64,{base64.b64encode(shape['svg'].encode()).decode()}"
    
    return {
        "type": "mcq",
        "question": f"Which object is shaped like a {selected_name}?",
        "image": shape_img,
        "topic": "Geometry / 3D Shapes",
        "options": options,
        "answer": correct_answer
    }

# --- Mapping ---

GRADE3_GENERATORS = {
    "Number Sense / Addition": lambda: random.choice([generate_addition_2digit, generate_addition_3digit])(),
    "Number Sense / Subtraction": lambda: random.choice([generate_subtraction_2digit, generate_subtraction_3digit])(),
    "Number Sense / Multiplication": lambda: random.choice([generate_multiplication_tables_6to9, generate_multiplication_tables_12to19])(),
    "Number Sense / Division": lambda: random.choice([generate_division_1stlevel, generate_division_2ndlevel])(),
    "Number Sense / Missing Number": lambda: random.choice([generate_missing_number_addition, generate_missing_number_subtraction])(),
    "Number Sense / Mixed Operations": lambda: random.choice([generate_addition_then_subtraction, generate_subtraction_then_addition])(),
    "Number Sense / Fractions": generate_fractions,
    "Number Sense / Compare Fractions": generate_compare_fractions,
    "Number Sense / Number Names": generate_number_to_words,
    "Number Sense / Number Reading": generate_words_to_number,
    "Number Sense / Doubling": generate_doubling_question,
    "Number Sense / Halving": generate_halving_question,
    "Geometry / 3D Shapes": generate_3d_shape_matching,
    "Geometry / Symmetry": generate_symmetry,
    "Geometry / Shape Recognition": generate_shape_composition,
    "Measurement / Length": generate_length_conversion,
    "Measurement / Weight": generate_weight_conversion,
    "Measurement / Capacity": generate_capacity_conversion,
    "Measurement / Time": generate_time_reading,
    "Money / Basics": generate_identify_money,
    "Money / Operations": generate_money_operations,
    "Data Handling / Tally": generate_tally,
    "Patterns / Number Patterns": generate_number_pattern
}
