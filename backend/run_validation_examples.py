#!/usr/bin/env python
"""
Validation Examples for Script Refinement

This script demonstrates the validation mechanism for the script refinement process
with detailed examples showing how the system enforces boundaries on modifications.

It provides educational examples that illustrate:
1. Proper selective modification (only modifying selected sentences)
2. Detection and correction of unauthorized changes
3. Handling length mismatches in returned scripts
4. Complete validation metadata for transparency

These examples can be used for documentation, testing, and understanding the system's constraints.
"""

import json
from pathlib import Path
from main import process_marked_output
import colorama
from colorama import Fore, Style

# Initialize colorama for cross-platform colored terminal output
colorama.init()

def print_header(text):
    """Print a formatted header section"""
    print(f"\n{Fore.CYAN}{'=' * 80}")
    print(f"{text.center(80)}")
    print(f"{'=' * 80}{Style.RESET_ALL}\n")

def print_script_comparison(original, modified, selected_indices=None):
    """Print a formatted comparison of original and modified scripts"""
    print(f"{Fore.YELLOW}Original Script:{Style.RESET_ALL}")
    for i, (line, art) in enumerate(original):
        if selected_indices and i in selected_indices:
            prefix = f"{Fore.GREEN}[SELECTED] {i}: "
        else:
            prefix = f"{Fore.WHITE}[PRESERVE] {i}: "
        print(f"{prefix}Line: {line}")
        print(f"{' ' * len(prefix)}Art: {art}{Style.RESET_ALL}")
    
    print(f"\n{Fore.YELLOW}Generated Script:{Style.RESET_ALL}")
    for i, item in enumerate(modified):
        if i < len(original):
            orig_line, orig_art = original[i]
            is_modified = (item['line'] != orig_line or item['artDirection'] != orig_art)
            
            if is_modified and (not selected_indices or i not in selected_indices):
                prefix = f"{Fore.RED}[UNAUTHORIZED] {i}: "
            elif is_modified:
                prefix = f"{Fore.GREEN}[MODIFIED] {i}: "
            else:
                prefix = f"{Fore.WHITE}[UNCHANGED] {i}: "
        else:
            prefix = f"{Fore.MAGENTA}[EXTRA] {i}: "
            
        print(f"{prefix}Line: {item['line']}")
        print(f"{' ' * len(prefix)}Art: {item['artDirection']}{Style.RESET_ALL}")

def print_validation_metadata(metadata):
    """Print validation metadata in a readable format"""
    print(f"\n{Fore.YELLOW}Validation Metadata:{Style.RESET_ALL}")
    if metadata.get("had_unauthorized_changes", False):
        print(f"{Fore.RED}✘ Unauthorized changes detected{Style.RESET_ALL}")
    else:
        print(f"{Fore.GREEN}✓ No unauthorized changes{Style.RESET_ALL}")
        
    if metadata.get("had_length_mismatch", False):
        print(f"{Fore.RED}✘ Length mismatch detected (Original: {metadata.get('original_length')}, Received: {metadata.get('received_length')}){Style.RESET_ALL}")
    else:
        print(f"{Fore.GREEN}✓ Lengths match (Original: {metadata.get('original_length')}, Received: {metadata.get('received_length')}){Style.RESET_ALL}")
    
    if metadata.get("reverted_changes"):
        print(f"\n{Fore.RED}Reverted Changes:{Style.RESET_ALL}")
        for change in metadata.get("reverted_changes", []):
            index = change.get("index")
            original = change.get("original", {})
            attempted = change.get("attempted", {})
            
            print(f"{Fore.RED}Index {index}:{Style.RESET_ALL}")
            print(f"  Original: {original.get('line')} | {original.get('artDirection')}")
            print(f"  Attempted: {attempted.get('line')} | {attempted.get('artDirection')}")

def run_example_1():
    """Example 1: Only authorized changes - everything works as expected"""
    print_header("Example 1: Only Authorized Changes")
    
    # Sample original script
    original_script = [
        ("Original line 1", "Original art direction 1"),
        ("Original line 2", "Original art direction 2"),
        ("Original line 3", "Original art direction 3"),
        ("Original line 4", "Original art direction 4"),
    ]
    
    # Selected sentences (indices 1 and 2)
    selected_sentences = [1, 2]
    
    # Simulated generated output with only selected sentences modified
    generated_output = '''[
        ("Original line 1", "Original art direction 1"),
        ("Modified line 2", "Modified art direction 2"),
        ("Modified line 3", "Modified art direction 3"),
        ("Original line 4", "Original art direction 4")
    ]'''
    
    print(f"{Fore.YELLOW}Description:{Style.RESET_ALL} Only modifying sentences at indices {selected_sentences}")
    print(f"{Fore.YELLOW}Expected Outcome:{Style.RESET_ALL} All changes will be accepted with no validation issues\n")
    
    # Process the output through our validation mechanism
    result, meta = process_marked_output(generated_output, original_script, selected_sentences)
    
    # Print comparison and validation results
    print_script_comparison(original_script, result, selected_sentences)
    print_validation_metadata(meta)

def run_example_2():
    """Example 2: Unauthorized changes - should be detected and reverted"""
    print_header("Example 2: Unauthorized Changes")
    
    # Sample original script
    original_script = [
        ("Original line 1", "Original art direction 1"),
        ("Original line 2", "Original art direction 2"),
        ("Original line 3", "Original art direction 3"),
        ("Original line 4", "Original art direction 4"),
    ]
    
    # Only index 1 is selected
    selected_sentences = [1]
    
    # Simulated output with unauthorized changes to non-selected sentences
    generated_output = '''[
        ("THIS SHOULD BE REVERTED", "THIS SHOULD ALSO BE REVERTED"),
        ("Modified line 2", "Modified art direction 2"),
        ("THIS SHOULD BE REVERTED TOO", "AND THIS"),
        ("YET ANOTHER UNAUTHORIZED CHANGE", "ANOTHER ONE")
    ]'''
    
    print(f"{Fore.YELLOW}Description:{Style.RESET_ALL} Only index {selected_sentences} is selected, but changes were made to all lines")
    print(f"{Fore.YELLOW}Expected Outcome:{Style.RESET_ALL} Unauthorized changes will be detected and reverted\n")
    
    # Process the output through our validation mechanism
    result, meta = process_marked_output(generated_output, original_script, selected_sentences)
    
    # Print comparison and validation results
    print_script_comparison(original_script, result, selected_sentences)
    print_validation_metadata(meta)

def run_example_3():
    """Example 3: Script with missing lines - should be adjusted to match original length"""
    print_header("Example 3: Script With Missing Lines")
    
    # Sample original script
    original_script = [
        ("Original line 1", "Original art direction 1"),
        ("Original line 2", "Original art direction 2"),
        ("Original line 3", "Original art direction 3"),
        ("Original line 4", "Original art direction 4"),
    ]
    
    # Selected sentences
    selected_sentences = [2, 3]
    
    # Simulated output with missing lines
    generated_output = '''[
        ("Original line 1", "Original art direction 1"),
        ("Original line 2", "Original art direction 2")
    ]'''
    
    print(f"{Fore.YELLOW}Description:{Style.RESET_ALL} Generated output is missing lines (only 2 lines instead of 4)")
    print(f"{Fore.YELLOW}Expected Outcome:{Style.RESET_ALL} Length mismatch will be detected and fixed by extending with original content\n")
    
    # Process the output through our validation mechanism
    result, meta = process_marked_output(generated_output, original_script, selected_sentences)
    
    # Print comparison and validation results
    print_script_comparison(original_script, result, selected_sentences)
    print_validation_metadata(meta)

def run_example_4():
    """Example 4: Script with extra lines - should be truncated to match original length"""
    print_header("Example 4: Script With Extra Lines")
    
    # Sample original script
    original_script = [
        ("Original line 1", "Original art direction 1"),
        ("Original line 2", "Original art direction 2"),
        ("Original line 3", "Original art direction 3"),
        ("Original line 4", "Original art direction 4"),
    ]
    
    # Only index 0 is selected
    selected_sentences = [0]
    
    # Simulated output with extra lines
    generated_output = '''[
        ("Modified line 1", "Modified art direction 1"),
        ("Original line 2", "Original art direction 2"),
        ("Original line 3", "Original art direction 3"),
        ("Original line 4", "Original art direction 4"),
        ("EXTRA LINE THAT SHOULD BE REMOVED", "EXTRA ART DIRECTION")
    ]'''
    
    print(f"{Fore.YELLOW}Description:{Style.RESET_ALL} Generated output has extra lines (5 lines instead of 4)")
    print(f"{Fore.YELLOW}Expected Outcome:{Style.RESET_ALL} Length mismatch will be detected and fixed by truncating extra content\n")
    
    # Process the output through our validation mechanism
    result, meta = process_marked_output(generated_output, original_script, selected_sentences)
    
    # Print comparison and validation results
    print_script_comparison(original_script, result, selected_sentences)
    print_validation_metadata(meta)

def run_example_5():
    """Example 5: Demonstrate how markers are removed from the output"""
    print_header("Example 5: Marker Removal")
    
    # Sample original script
    original_script = [
        ("Original line 1", "Original art direction 1"),
        ("Original line 2", "Original art direction 2"),
        ("Original line 3", "Original art direction 3"),
    ]
    
    # Selected sentences
    selected_sentences = [1]
    
    # Simulated output with markers still included
    generated_output = '''[
        ("[[PRESERVE: 0]] Original line 1 [[END PRESERVE]]", "[[PRESERVE: 0]] Original art direction 1 [[END PRESERVE]]"),
        ("[[SELECTED FOR MODIFICATION: 1]] Modified line 2 [[END SELECTED]]", "[[SELECTED FOR MODIFICATION: 1]] Modified art direction 2 [[END SELECTED]]"),
        ("[[PRESERVE: 2]] Original line 3 [[END PRESERVE]]", "[[PRESERVE: 2]] Original art direction 3 [[END PRESERVE]]")
    ]'''
    
    print(f"{Fore.YELLOW}Description:{Style.RESET_ALL} Generated output still contains marker tags that need to be removed")
    print(f"{Fore.YELLOW}Expected Outcome:{Style.RESET_ALL} All markers will be removed from the final output\n")
    
    # Process the output through our validation mechanism
    result, meta = process_marked_output(generated_output, original_script, selected_sentences)
    
    # Print comparison and validation results
    print_script_comparison(original_script, result, selected_sentences)
    print_validation_metadata(meta)

if __name__ == "__main__":
    run_example_1()
    run_example_2()
    run_example_3()
    run_example_4()
    run_example_5() 